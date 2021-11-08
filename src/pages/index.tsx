import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Head } from 'next/document';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  console.log(postsPagination);
  const [postsInScreen, setPostsInScreen] = useState<Post[]>([]);

  useEffect(() => {
    const posts = postsPagination.results.map((post): Post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });
    setPostsInScreen(posts);
  }, [postsPagination]);
  return (
    <>
      <Header />
      <main className={styles.content}>
        {postsInScreen.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <div>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <p>{post.first_publication_date}</p>
                <p>{post.data.author}</p>
              </div>
            </div>
          </Link>
        ))}
        <div>
          <button type="button">here</button>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 100,
    }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };
  return {
    props: {
      postsPagination,
    },
  };
};
