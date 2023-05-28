import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { PageLayout } from "~/components/Layout";
import LoadingSpinner, { LoadingPage } from "~/components/LoadingSpinner";
import { PostView } from "~/components/PostView";

import { api } from "~/utils/api";

const SinglePostPage: NextPage = () => {
  const { query } = useRouter();
  const postId = query.id as string;
  const { user } = useUser();

  const { data: post, isLoading: isPostLoading } =
    api.posts.getPostById.useQuery({ postId });

  const { data: author, isLoading: isAuthorLoading } =
    api.profile.getUserByUsername.useQuery({ username: user?.username ?? "" });

  if (isPostLoading || isAuthorLoading) {
    return <LoadingPage />;
  }

  if (!post || !author) {
    return (
      <PageLayout>
        <div className="flex h-full items-center justify-center">
          Post not found
        </div>
      </PageLayout>
    );
  }

  const fullPost = {
    post,
    author: { ...author, username: author.username ?? "" },
  };

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <PageLayout>
        <PostView {...fullPost} />
      </PageLayout>
    </>
  );
};

export default SinglePostPage;
