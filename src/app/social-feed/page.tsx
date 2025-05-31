"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Group,
  TextInput,
  Button,
  Chip,
  ScrollArea,
  Menu,
  Text,
  Divider,
  Modal,
  Textarea,
  FileButton,
} from "@mantine/core";
import {
  IconSearch,
  IconFilter,
  IconChevronDown,
  IconPlus,
} from "@tabler/icons-react";
import Image from "next/image";
import { PostCard } from "./PostCard";
import { CommentSection } from "./CommentSection";
import { api } from "~/trpc/react";
import { useInView } from "react-intersection-observer";
import { type RouterOutputs } from "~/trpc/react";
import {
  ExperienceLevel,
  type ExperienceLevel as ExperienceLevelType,
} from "@prisma/client";

type PostWithUser = RouterOutputs["post"]["getFeed"]["posts"][number];
type SortType = "date" | "comments" | "reactions";
type SortOrder = "asc" | "desc";

const EXPERIENCE_LEVEL_CONFIG = {
  BEGINNER: {
    label: "Beginner Trader",
    color: "gray",
    selectedColor: "#9BA4B5",
    hoverColor: "#E3EAF3",
    textColor: "#394867",
    selectedTextColor: "#4B5563",
  },
  INTERMEDIATE: {
    label: "Intermediate Trader",
    color: "cyan",
    selectedColor: "#00B8D9",
    hoverColor: "#E3EAF3",
    textColor: "#394867",
    selectedTextColor: "#00B8D9",
  },
  EXPERIENCED: {
    label: "Experienced Trader",
    color: "blue",
    selectedColor: "#228BE6",
    hoverColor: "#E3EAF3",
    textColor: "#394867",
    selectedTextColor: "#228BE6",
  },
} as const;

const EXPERIENCE_LEVELS = Object.entries(EXPERIENCE_LEVEL_CONFIG).map(
  ([value, config]) => ({
    value: value as ExperienceLevelType,
    ...config,
  }),
);

const getExperienceLevelConfig = (level: ExperienceLevelType) => {
  return EXPERIENCE_LEVEL_CONFIG[level] ?? EXPERIENCE_LEVEL_CONFIG.BEGINNER;
};

const mapExperienceLevel = (level: ExperienceLevel): ExperienceLevelType => {
  switch (level) {
    case ExperienceLevel.BEGINNER:
      return "BEGINNER";
    case ExperienceLevel.INTERMEDIATE:
      return "INTERMEDIATE";
    case ExperienceLevel.EXPERIENCED:
      return "EXPERIENCED";
  }
};

function CreatePostDialog({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const utils = api.useUtils();

  const uploadImage = api.post.uploadImage.useMutation();
  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      setContent("");
      setImage(null);
      setImagePreview(null);
      onClose();
      void utils.post.getFeed.invalidate();
    },
  });

  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setImagePreview(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    if (content.trim() === "") return;

    try {
      let imageUrl: string | undefined;
      if (image && imagePreview) {
        // Upload image first
        const result = await uploadImage.mutateAsync({
          file: imagePreview,
          fileName: image.name,
        });
        imageUrl = result.url;
      }

      // Create post with image URL
      await createPost.mutateAsync({ content, image: imageUrl });
    } catch (error) {
      console.error("Error creating post:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Post"
      size="lg"
      centered
    >
      <Stack gap="md">
        <Textarea
          placeholder="Share your trading thoughts..."
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          minRows={4}
          maxRows={8}
          radius="md"
          styles={{ input: { background: "#E3EAF3" } }}
        />
        <Group>
          <FileButton onChange={handleImageChange} accept="image/*">
            {(props) => (
              <Button
                {...props}
                variant="light"
                color="gray"
                radius="xl"
                leftSection={<IconPlus size={16} />}
              >
                Add Image
              </Button>
            )}
          </FileButton>
          {imagePreview && (
            <Box
              style={{
                position: "relative",
                width: 100,
                height: 100,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                style={{ objectFit: "cover" }}
                unoptimized // Since this is a data URL
              />
              <Button
                variant="filled"
                color="red"
                size="xs"
                radius="xl"
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  padding: 4,
                  zIndex: 1,
                }}
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
              >
                ×
              </Button>
            </Box>
          )}
        </Group>
        <Group justify="flex-end" mt="md">
          <Button variant="light" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={
              !content.trim() || createPost.isPending || uploadImage.isPending
            }
            loading={createPost.isPending || uploadImage.isPending}
          >
            Post
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default function SocialFeedPage() {
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<ExperienceLevelType>();
  const [sort, setSort] = useState<SortType>("date");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [createPostOpened, setCreatePostOpened] = useState(false);

  // Infinite query for posts
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.post.getFeed.useInfiniteQuery(
      {
        limit: 5,
        search,
        label: selectedLabel ? ExperienceLevel[selectedLabel] : undefined,
        sort,
        order,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const { ref, inView } = useInView({ triggerOnce: false });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Helper to format time ago
  function formatTimeAgo(date: string | Date) {
    const d = typeof date === "string" ? new Date(date) : date;
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return d.toLocaleDateString();
  }

  return (
    <Box
      w="100%"
      h="100%"
      px={32}
      py={24}
      style={{ background: "#F1F6F9", minHeight: "100vh" }}
    >
      <Stack gap={24}>
        {/* Top Filters Bar */}
        <Group justify="space-between" gap={16}>
          <Group gap={16}>
            <TextInput
              placeholder="Search trading post..."
              leftSection={<IconSearch size={18} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={260}
              radius="xl"
              styles={{ input: { background: "#E3EAF3", fontWeight: 500 } }}
            />
            <Group gap={8}>
              {EXPERIENCE_LEVELS.map((level) => {
                const isSelected = selectedLabel === level.value;
                return (
                  <Chip
                    key={level.value}
                    checked={isSelected}
                    onChange={() => {
                      setSelectedLabel((prev) =>
                        prev === level.value ? undefined : level.value,
                      );
                    }}
                    radius="xl"
                    size="md"
                    color={level.color}
                    variant="light"
                    styles={{
                      root: {
                        "&[dataChecked]": {
                          backgroundColor: level.selectedColor,
                          borderColor: level.selectedColor,
                          "&:hover": {
                            backgroundColor: level.selectedColor,
                            borderColor: level.selectedColor,
                          },
                        },
                        "&:hover": {
                          backgroundColor: level.hoverColor,
                          borderColor: level.hoverColor,
                        },
                      },
                      label: {
                        fontWeight: 600,
                        color: isSelected
                          ? level.selectedTextColor
                          : level.textColor,
                        "&:hover": {
                          color: isSelected
                            ? level.selectedTextColor
                            : level.textColor,
                        },
                      },
                    }}
                  >
                    {level.label}
                  </Chip>
                );
              })}
            </Group>
            <Menu shadow="md" width={220} position="bottom-end" withArrow>
              <Menu.Target>
                <Button
                  leftSection={<IconFilter size={18} />}
                  rightSection={<IconChevronDown size={16} />}
                  variant="light"
                  color="#394867"
                  radius="xl"
                  style={{ fontWeight: 600 }}
                >
                  Sort {order === "asc" ? "↑" : "↓"}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Sort by</Menu.Label>
                <Menu.Item
                  onClick={() => setSort("date")}
                  color={sort === "date" ? "blue" : undefined}
                >
                  Date
                </Menu.Item>
                <Menu.Item
                  onClick={() => setSort("comments")}
                  color={sort === "comments" ? "blue" : undefined}
                >
                  Number of Comments
                </Menu.Item>
                <Menu.Item
                  onClick={() => setSort("reactions")}
                  color={sort === "reactions" ? "blue" : undefined}
                >
                  Number of Reactions
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label>Order</Menu.Label>
                <Menu.Item
                  onClick={() => setOrder("asc")}
                  color={order === "asc" ? "blue" : undefined}
                >
                  Ascending ↑
                </Menu.Item>
                <Menu.Item
                  onClick={() => setOrder("desc")}
                  color={order === "desc" ? "blue" : undefined}
                >
                  Descending ↓
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
          <Button
            leftSection={<IconPlus size={18} />}
            radius="xl"
            onClick={() => setCreatePostOpened(true)}
          >
            Create Post
          </Button>
        </Group>
        <Divider my={0} />
        {/* Feed List (infinite scroll) */}
        <ScrollArea h="calc(100vh - 180px)" type="never">
          <Stack gap={32}>
            {data?.pages.flatMap((page) =>
              page.posts.map((post: PostWithUser) => {
                const levelString = mapExperienceLevel(post.label);
                const config = getExperienceLevelConfig(levelString);
                return (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    user={{
                      id: post.user.id,
                      name: post.user.name ?? "Anonymous",
                      avatar: post.user.image ?? undefined,
                      label: post.label,
                      labelColor: config.color,
                    }}
                    time={formatTimeAgo(post.createdAt as unknown as string)}
                    content={post.content}
                    image={post.image ?? undefined}
                    reactions={post.reactionsCount}
                    comments={post.commentsCount}
                    onCommentClick={() => setSelectedPost(post.id as string)}
                  />
                );
              }),
            )}
            <div ref={ref} />
            {isFetchingNextPage && (
              <Text ta="center" c="#394867" size="sm">
                Loading more posts...
              </Text>
            )}
          </Stack>
        </ScrollArea>
        {/* Right-side CommentSection */}
        {selectedPost && (
          <CommentSection
            postId={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </Stack>
      <CreatePostDialog
        opened={createPostOpened}
        onClose={() => setCreatePostOpened(false)}
      />
    </Box>
  );
}
