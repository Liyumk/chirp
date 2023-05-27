import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import LoadingSpinner, { LoadingPage } from "~/components/LoadingSpinner";
import {
  type KeyboardEvent,
  type MouseEvent,
  useState,
  type MouseEventHandler,
} from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/Layout";
import { PostView } from "~/components/PostView";

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      console.log(errorMessage);
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  if (!user) return null;

  const onPost = (eventKeyboard?: KeyboardEvent<HTMLInputElement>) => {
    if (eventKeyboard && eventKeyboard.key !== "Enter") return;
    if (input.length === 0) return;
    mutate({ content: input });
  };

  return (
    <>
      <input
        placeholder="Type some emojis!"
        className="p-x-4 grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => onPost(e)}
      />
      <button
        disabled={input.length === 0}
        onClick={() => onPost()}
        className="disabled:text-slate-400"
      >
        {isLoading ? <LoadingSpinner size={22} /> : "Post"}
      </button>
    </>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong!</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching ASAP
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && <SignInButton />}
        {isSignedIn && (
          <div className="flex w-full gap-3">
            <UserButton />
            <CreatePostWizard />
          </div>
        )}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
