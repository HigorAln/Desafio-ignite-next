/* eslint-disable react/no-array-index-key */
/* eslint-disable no-use-before-define */
import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import PtBR from 'date-fns/locale/pt-BR';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import React from 'react';
import { useState } from 'react';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  console.log(post);
  const { isFallback } = useRouter();

  if (isFallback) {
    return <h1>Carregando...</h1>;
  }
  return (
    <>
      <Header ActivePost />
      <main className={styles.container}>
        <div>
          <img src={post.data.banner.url} alt="banner post" />
        </div>
        <div className={styles.content}>
          <h1>{post.data.title}</h1>
          <div>
            <span>
              <FiCalendar />
              <p>
                {format(new Date(post.first_publication_date), 'dd MMM yyy', {
                  locale: ptBR,
                })}
              </p>
            </span>
            <span>
              <FiUser />
              <p>{post.data.author}</p>
            </span>
            <span>
              <FiClock />
              <p>4 min</p>
            </span>
          </div>
          <section>
            {post.data.content.map((postContent, index) => (
              <React.Fragment key={index}>
                <h1>{postContent.heading}</h1>
                <p>{RichText.asText(postContent.body)}</p>
              </React.Fragment>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'posts')
  );
  const paths = posts.results.map(post => {
    return {
      params: { slug: String(post.uid) },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post,
    },
  };
};
