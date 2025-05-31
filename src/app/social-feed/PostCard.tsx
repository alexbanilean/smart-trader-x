import {
  Box,
  Group,
  Avatar,
  Text,
  Stack,
  ActionIcon,
  Badge,
  Image,
  Menu,
  Modal,
  Button,
} from "@mantine/core";
import {
  IconThumbUp,
  IconMessageCircle,
  IconMoodSmile,
  IconShare,
  IconTrash,
  IconDotsVertical,
  IconX,
} from "@tabler/icons-react";
import { ExperienceLevel } from "@prisma/client";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { useState } from "react";

const getLabelDisplay = (label: ExperienceLevel): string => {
  switch (label) {
    case ExperienceLevel.BEGINNER:
      return "Beginner Trader";
    case ExperienceLevel.INTERMEDIATE:
      return "Intermediate Trader";
    case ExperienceLevel.EXPERIENCED:
      return "Experienced Trader";
  }
};

export type PostCardProps = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    label: ExperienceLevel;
    labelColor: string;
  };
  time: string;
  content: string;
  image?: string;
  reactions: number;
  comments: number;
  onCommentClick?: () => void;
  onDelete?: () => void;
};

export function PostCard({
  id,
  user,
  time,
  content,
  image,
  reactions,
  comments,
  onCommentClick,
  onDelete,
}: PostCardProps) {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const isOwner = session?.user?.id === user.id;
  const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);
  const [imageDialogOpened, setImageDialogOpened] = useState(false);

  const deletePost = api.post.delete.useMutation({
    onSuccess: () => {
      void utils.post.getFeed.invalidate();
      onDelete?.();
    },
  });

  const handleDelete = () => {
    setDeleteDialogOpened(true);
  };

  const confirmDelete = () => {
    deletePost.mutate({ postId: id });
    setDeleteDialogOpened(false);
  };

  return (
    <>
      <Box
        bg="#D9DEE6"
        p={24}
        style={{ boxShadow: "0 2px 8px #39486722", borderRadius: 24 }}
      >
        <Stack gap={12}>
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Group gap={12} align="center">
              <Avatar src={user.avatar} radius={999} size={44} color="gray">
                {user.name[0]}
              </Avatar>
              <Stack gap={0}>
                <Group gap={8} align="center">
                  <Text fw={700} size="md" c="#212A3E">
                    {user.name}
                  </Text>
                  <Badge
                    color={user.labelColor}
                    variant="light"
                    radius="xl"
                    size="md"
                    style={{ fontWeight: 600 }}
                  >
                    {getLabelDisplay(user.label)}
                  </Badge>
                </Group>
                <Text size="xs" c="#7B8794">
                  {time}
                </Text>
              </Stack>
            </Group>
            <Group gap={8}>
              <ActionIcon variant="subtle" color="#394867">
                <IconMoodSmile size={20} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="#394867"
                onClick={onCommentClick}
              >
                <IconMessageCircle size={20} />
              </ActionIcon>
              <ActionIcon variant="subtle" color="#394867">
                <IconShare size={20} />
              </ActionIcon>
              {isOwner && (
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="#394867">
                      <IconDotsVertical size={20} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={handleDelete}
                    >
                      Delete Post
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
          </Group>
          {/* Content */}
          <Group align="flex-start" gap={16}>
            <Box style={{ flex: 1 }}>
              <Text
                size="md"
                c="#394867"
                style={{
                  fontWeight: 500,
                  background: "#C7CED9",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                {content}
              </Text>
            </Box>
            {image && (
              <Box
                style={{
                  cursor: "pointer",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
                onClick={() => setImageDialogOpened(true)}
              >
                <Image
                  src={image}
                  radius={16}
                  w={120}
                  h={90}
                  fit="cover"
                  alt="post image"
                />
              </Box>
            )}
          </Group>
          {/* Reactions/Comments */}
          <Group gap={24} mt={8}>
            <Group gap={4} align="center">
              <IconThumbUp size={18} color="#394867" />
              <Text size="sm" c="#394867" fw={600}>
                {reactions}
              </Text>
            </Group>
            <Group gap={4} align="center">
              <IconMessageCircle size={18} color="#394867" />
              <Text size="sm" c="#394867" fw={600}>
                {comments}
              </Text>
            </Group>
          </Group>
        </Stack>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Modal
        opened={deleteDialogOpened}
        onClose={() => setDeleteDialogOpened(false)}
        title="Delete Post"
        centered
        size="sm"
        styles={{
          title: { color: "#394867", fontWeight: 600 },
          content: { background: "#E3EAF3" },
          header: { background: "#D9DEE6" },
        }}
      >
        <Stack>
          <Text c="#394867" mt={16}>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              color="gray"
              onClick={() => setDeleteDialogOpened(false)}
              styles={{
                root: {
                  background: "#C7CED9",
                  color: "#394867",
                  "&:hover": { background: "#B8C1D0" },
                },
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={confirmDelete}
              loading={deletePost.isPending}
              styles={{
                root: {
                  background: "#E03131",
                  "&:hover": { background: "#C92A2A" },
                },
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Fullscreen Image Dialog */}
      <Modal
        opened={imageDialogOpened}
        onClose={() => setImageDialogOpened(false)}
        centered
        fullScreen
        padding={0}
        withCloseButton={false}
        styles={{
          content: {
            background: "#212A3E",
          },
          body: {
            padding: 0,
            height: "100vh",
            width: "100vw",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          },
          inner: {
            padding: 0,
          },
        }}
      >
        <Box
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#212A3E",
          }}
        >
          <ActionIcon
            variant="filled"
            size="xl"
            radius="xl"
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 1000,
              background: "rgba(57, 72, 103, 0.9)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              "&:hover": {
                background: "rgba(44, 52, 64, 0.95)",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
            }}
            onClick={() => setImageDialogOpened(false)}
          >
            <IconX size={24} />
          </ActionIcon>
          {image && (
            <Box
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "24px",
              }}
            >
              <Image
                src={image}
                alt="Post image"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
                fit="contain"
              />
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
}
