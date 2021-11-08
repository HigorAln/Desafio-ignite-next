import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

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
  const [postsInScreen, setPostsInScreen] = useState<Post[]>([]);
  const [next_page, setNext_page] = useState('');

  const handleClick = (): void => {
    fetch(next_page)
      .then(res => res.json())
      .then(res => {
        const newValue = {
          uid: res.results[0].uid,
          first_publication_date: format(
            new Date(res.results[0].first_publication_date),
            'dd MMM yyy',
            {
              locale: ptBR,
            }
          ),
          data: {
            title: res.results[0].data.title,
            subtitle: res.results[0].data.subtitle,
            author: res.results[0].data.author,
          },
        };
        setNext_page(res.next_page);
        setPostsInScreen([...postsInScreen, newValue]);
      });
  };

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
    setNext_page(postsPagination.next_page);
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
        <div className={styles.buttonReadMore}>
          {next_page !== null ? (
            <button type="button" onClick={handleClick}>
              Carregar mais posts
            </button>
          ) : (
            ''
          )}
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
      pageSize: 1,
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
