import {
  Box,
  Stack,
  Group,
  Avatar,
  Text,
  Textarea,
  Button,
  Divider,
} from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";
import { IconThumbUp } from "@tabler/icons-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/react";

type CommentWithUser = RouterOutputs["comment"]["getByPost"][number];

export function CommentSection({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const [comment, setComment] = useState("");
  const {
    data: comments,
    refetch,
    isLoading,
  } = api.comment.getByPost.useQuery({ postId });
  const addComment = api.comment.create.useMutation({
    onSuccess: () => {
      setComment("");
      void refetch();
    },
  });

  const { data: post } = api.post.getById.useQuery({ id: postId });

  const handleAddComment = () => {
    if (comment.trim() === "") return;
    addComment.mutate({ postId, content: comment });
  };

  return (
    <Box
      h="100vh"
      w={360}
      bg="#E3EAF3"
      style={{
        boxShadow: "-2px 0 12px #39486722",
        zIndex: 100,
        position: "fixed",
        top: 0,
        right: 0,
      }}
    >
      <Stack h="100%" justify="space-between">
        <Box>
          <Stack gap={0}>
            <Group justify="space-between" p={24}>
              <Text fw={700} size="lg" c="#394867">
                Comments
              </Text>
              <Button variant="light" color="gray" onClick={onClose}>
                Close
              </Button>
            </Group>

            <Group gap={24} px={24} py={16}>
              <Group gap={4} align="center">
                <IconThumbUp size={18} color="#394867" />
                <Text size="sm" c="#394867" fw={600}>
                  {post?.reactionsCount}
                </Text>
              </Group>
              <Group gap={4} align="center">
                <IconMessageCircle size={18} color="#394867" />
                <Text size="sm" c="#394867" fw={600}>
                  {post?.commentsCount}
                </Text>
              </Group>
            </Group>
          </Stack>

          <Divider my={0} />
          <Stack gap={16} p={24}>
            {isLoading && <Text c="#394867">Loading...</Text>}
            {comments?.map((c: CommentWithUser) => (
              <Stack key={c.id} align="flex-start" gap={4}>
                <Group gap={12}>
                  <Avatar radius={999} size={36} color="gray">
                    {c.user.name?.[0] ?? "?"}
                  </Avatar>
                  <Box>
                    <Text fw={700} size="sm" c="#212A3E">
                      {c.user.name ?? "Anonymous"}
                    </Text>
                    <Text size="xs" c="#7B8794" mt={2}>
                      {new Date(
                        c.createdAt as unknown as string,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Box>
                </Group>
                <Text
                  size="sm"
                  c="#394867"
                  mt={8}
                  style={{ wordBreak: "break-word" }}
                >
                  {c.content}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Box p={24} pb={32} bg="#D9DEE6">
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            minRows={2}
            maxRows={4}
            radius={16}
            styles={{ input: { background: "#E3EAF3" } }}
          />
          <Button
            mt={12}
            fullWidth
            radius="xl"
            onClick={handleAddComment}
            disabled={!comment.trim() || addComment.isPending}
          >
            + Comment
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
