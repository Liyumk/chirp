import { useUser } from "@clerk/nextjs";
import {
  type InferGetStaticPropsType,
  type GetStaticProps,
  type NextPage,
} from "next";
import Head from "next/head";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { prisma } from "~/server/db";
import { PageLayout } from "~/components/Layout";
import Image from "next/image";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>Not found</div>;

  return (
    <>
      <Head>
        <title>{username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-48 border-slate-400 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${username}'s profile picture`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
          />
        </div>
        <div className="mt-[64px] border-b border-b-slate-300 p-4 text-2xl font-semibold">
          {`@${data.username ?? ""}`}
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("slug is not a string");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({
    username: username,
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  };
};

export default ProfilePage;
