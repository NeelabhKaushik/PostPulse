"use client";

import { toast } from "@/hooks/use-toast";
import { UsernameValidator, Usernamerequest } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface UserNameFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: Pick<User, "id" | "username">;
}

const UserNameForm = ({ user, className, ...props }: UserNameFormProps) => {
  const router = useRouter();
  const [input, setInput] = useState<string>("");
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<Usernamerequest>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username || "",
    },
  });

  const { mutate: updateUsername, isLoading } = useMutation({
    mutationFn: async ({ name }: Usernamerequest) => {
      const payload: Usernamerequest = { name };
      //@ts-ignore
      const { data } = axios.patch(`/api/username`, payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Username already taken.",
            description: "Please choose another username.",
            variant: "destructive",
          });
        }
      }

      return toast({
        title: "Something went wrong.",
        description: "Your username was not updated. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        description: "Your username has been updated.",
      });
      router.push("/");
      router.refresh();
    },
  });
  return (
    <div className="container flex items-center h-full max-w-3xl mx-auto">
      <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Change your username</h1>
        </div>
        <hr className="bg-red-500 h-px" />
        <div>
          <p className="text-xs pb-2">
            Username can only contain letters (a-z, A-Z), numbers (0-9), or
            underscores (_).
          </p>
          <div className="relative">
            <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
              u/
            </p>
            <Input
              id="name"
              value={input}
              className="pl-6"
              {...register("name")}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          {errors?.name && (
            <p className="px-1 mt-2 text-xs text-red-600">
              Please write username in required format.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            disabled={isLoading}
            variant="subtle"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={handleSubmit((e) => updateUsername(e))}
          >
            Change
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserNameForm;
