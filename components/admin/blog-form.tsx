"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Highlighter,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Save,
  Upload,
  FileText,
  Settings,
  Tag,
  User,
  Calendar,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createBlog } from "@/actions/blogs/create";
import { updateBlog } from "@/actions/blogs/update";
import { getAllAuthors } from "@/actions/authors/read";
import { Blog } from "@/lib/generated/prisma/client";

type BlogWithAuthor = Blog & {
  author: {
    id: string;
    name: string;
    email: string | null;
    avatarUrl: string;
  };
};

interface BlogFormProps {
  blog?: BlogWithAuthor;
  isEditing?: boolean;
}

export default function BlogForm({ blog, isEditing = false }: BlogFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authors, setAuthors] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<string[]>(() => {
    if (!blog?.keywords) return [];
    if (Array.isArray(blog.keywords)) {
      // Type guard: ensure all items are strings
      return blog.keywords.filter((k): k is string => typeof k === "string");
    }
    return [];
  });
  const [newKeyword, setNewKeyword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: blog?.title || "",
    description: blog?.description || "",
    author_id: blog?.authorId || "",
    is_published: blog?.isPublished || false,
    seo_title: blog?.seoTitle || "",
    seo_description: blog?.seoDescription || "",
    featured_image: null as File | null,
  });

  // Custom Image extension with full cropping control
  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: 400,
          parseHTML: (element) =>
            parseInt(element.getAttribute("width") || "400"),
          renderHTML: (attributes) => {
            return { width: attributes.width };
          },
        },
        height: {
          default: 300,
          parseHTML: (element) =>
            parseInt(element.getAttribute("height") || "300"),
          renderHTML: (attributes) => {
            return { height: attributes.height };
          },
        },
        style: {
          default:
            "display: block; margin: 1rem 0; border-radius: 0.375rem; cursor: pointer; object-fit: cover;",
          parseHTML: (element) => element.getAttribute("style"),
          renderHTML: (attributes) => {
            const width = attributes.width || 400;
            const height = attributes.height || 300;
            return {
              style: `width: ${width}px; height: ${height}px; display: block; margin: 1rem 0; border-radius: 0.375rem; cursor: pointer; object-fit: cover;`,
            };
          },
        },
      };
    },
    addCommands() {
      return {
        ...this.parent?.(),
        setImage:
          (options) =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: {
                ...options,
                width: 400,
                height: 300,
              },
            });
          },
        updateImageSize:
          (options: any) =>
          ({ commands }: { commands: any }) => {
            return commands.updateAttributes(this.name, options);
          },
      };
    },
    addNodeView() {
      return ({ node, getPos, editor }) => {
        const container = document.createElement("div");
        container.className = "image-wrapper relative inline-block group";

        const img = document.createElement("img");
        img.src = node.attrs.src;
        img.alt = node.attrs.alt || "";
        img.className = "blog-image";
        img.width = node.attrs.width || 400;
        img.height = node.attrs.height || 300;
        img.style.cssText = `width: ${node.attrs.width || 400}px; height: ${
          node.attrs.height || 300
        }px; display: block; margin: 1rem 0; border-radius: 0.375rem; cursor: pointer; object-fit: cover;`;

        // Create resize handles
        const resizeHandles = document.createElement("div");
        resizeHandles.className =
          "resize-handles absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none";
        resizeHandles.innerHTML = `
          <div class="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-orange-500 cursor-se-resize pointer-events-auto"></div>
          <div class="resize-handle absolute bottom-0 left-0 w-3 h-3 bg-orange-500 cursor-sw-resize pointer-events-auto"></div>
          <div class="resize-handle absolute top-0 right-0 w-3 h-3 bg-orange-500 cursor-ne-resize pointer-events-auto"></div>
          <div class="resize-handle absolute top-0 left-0 w-3 h-3 bg-orange-500 cursor-nw-resize pointer-events-auto"></div>
        `;

        // Create image editor controls
        const controls = document.createElement("div");
        controls.className =
          "image-editor-controls absolute top-2 left-2 bg-gray-800 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col gap-2 min-w-[200px]";
        controls.innerHTML = `
          <div class="flex items-center gap-2">
            <label class="text-white text-xs">W:</label>
            <input type="number" class="width-input w-16 px-1 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded" value="${
              node.attrs.width || 400
            }" min="50" max="1200">
            <label class="text-white text-xs">H:</label>
            <input type="number" class="height-input w-16 px-1 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded" value="${
              node.attrs.height || 300
            }" min="50" max="800">
          </div>
          <div class="flex gap-1">
            <button class="preset-btn text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors" data-width="200" data-height="150">Small</button>
            <button class="preset-btn text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors" data-width="400" data-height="300">Medium</button>
            <button class="preset-btn text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors" data-width="600" data-height="400">Large</button>
          </div>
          <div class="flex gap-1 pt-1 border-t border-gray-600">
            <button class="delete-btn text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors w-full">Delete Image</button>
          </div>
        `;

        const widthInput = controls.querySelector(
          ".width-input"
        ) as HTMLInputElement;
        const heightInput = controls.querySelector(
          ".height-input"
        ) as HTMLInputElement;

        // Update image size function
        const updateImageSize = (width: number, height: number) => {
          const pos = getPos();
          if (typeof pos === "number") {
            img.width = width;
            img.height = height;
            img.style.cssText = `width: ${width}px; height: ${height}px; display: block; margin: 1rem 0; border-radius: 0.375rem; cursor: pointer; object-fit: cover;`;
            widthInput.value = width.toString();
            heightInput.value = height.toString();
            editor.commands.updateAttributes("image", { width, height });
          }
        };

        // Input field handlers
        widthInput.addEventListener("input", (e) => {
          const width = parseInt((e.target as HTMLInputElement).value);
          if (width >= 50 && width <= 1200) {
            updateImageSize(width, parseInt(heightInput.value));
          }
        });

        heightInput.addEventListener("input", (e) => {
          const height = parseInt((e.target as HTMLInputElement).value);
          if (height >= 50 && height <= 800) {
            updateImageSize(parseInt(widthInput.value), height);
          }
        });

        // Preset button and delete button handlers
        controls.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.target as HTMLElement;

          if (target.classList.contains("preset-btn")) {
            const width = parseInt(target.getAttribute("data-width") || "400");
            const height = parseInt(
              target.getAttribute("data-height") || "300"
            );
            updateImageSize(width, height);
          } else if (target.classList.contains("delete-btn")) {
            const pos = getPos();
            if (typeof pos === "number") {
              editor.commands.deleteRange({ from: pos, to: pos + 1 });
            }
          }
        });

        // Drag resize functionality
        let isResizing = false;
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;
        let resizeDirection = "";

        resizeHandles.addEventListener("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.target as HTMLElement;
          if (target.classList.contains("resize-handle")) {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = img.width;
            startHeight = img.height;

            if (target.classList.contains("cursor-se-resize"))
              resizeDirection = "se";
            else if (target.classList.contains("cursor-sw-resize"))
              resizeDirection = "sw";
            else if (target.classList.contains("cursor-ne-resize"))
              resizeDirection = "ne";
            else if (target.classList.contains("cursor-nw-resize"))
              resizeDirection = "nw";

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }
        });

        const handleMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;

          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          let newWidth = startWidth;
          let newHeight = startHeight;

          switch (resizeDirection) {
            case "se":
              newWidth = Math.max(50, Math.min(1200, startWidth + deltaX));
              newHeight = Math.max(50, Math.min(800, startHeight + deltaY));
              break;
            case "sw":
              newWidth = Math.max(50, Math.min(1200, startWidth - deltaX));
              newHeight = Math.max(50, Math.min(800, startHeight + deltaY));
              break;
            case "ne":
              newWidth = Math.max(50, Math.min(1200, startWidth + deltaX));
              newHeight = Math.max(50, Math.min(800, startHeight - deltaY));
              break;
            case "nw":
              newWidth = Math.max(50, Math.min(1200, startWidth - deltaX));
              newHeight = Math.max(50, Math.min(800, startHeight - deltaY));
              break;
          }

          updateImageSize(newWidth, newHeight);
        };

        const handleMouseUp = () => {
          isResizing = false;
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        container.appendChild(img);
        container.appendChild(resizeHandles);
        container.appendChild(controls);

        return {
          dom: container,
          update: (updatedNode) => {
            if (updatedNode.type !== node.type) return false;
            img.src = updatedNode.attrs.src;
            img.alt = updatedNode.attrs.alt || "";
            img.width = updatedNode.attrs.width || 400;
            img.height = updatedNode.attrs.height || 300;
            img.style.cssText = `width: ${
              updatedNode.attrs.width || 400
            }px; height: ${
              updatedNode.attrs.height || 300
            }px; display: block; margin: 1rem 0; border-radius: 0.375rem; cursor: pointer; object-fit: cover;`;
            widthInput.value = (updatedNode.attrs.width || 400).toString();
            heightInput.value = (updatedNode.attrs.height || 300).toString();
            return true;
          },
        };
      };
    },
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: "blog-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-orange-400 underline hover:text-orange-300",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-yellow-200 text-black px-1 rounded",
        },
      }),
      Typography,
      Underline,
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your blog post...",
      }),
    ],
    content: blog?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[400px] focus:outline-none p-4 bg-gray-800 rounded-lg border border-gray-600",
      },
      handleDrop: (view, event, slice, moved) => {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files[0]
        ) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf("image") === 0) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              handleImageUpload(file);
            }
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    const fetchAuthors = async () => {
      const { authors: fetchedAuthors, error } = await getAllAuthors();
      if (!error) {
        setAuthors(fetchedAuthors);
      }
    };
    fetchAuthors();
  }, []);

  const handleImageUpload = async (file: File) => {
    if (!editor) return;

    try {
      // 1) Get presigned URL from API
      const presignRes = await fetch("/api/sevalla/blog-image-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "image/jpeg",
          folder: "images",
        }),
      });

      if (!presignRes.ok) {
        const errorData = await presignRes.json();
        toast.error(errorData.error || "Failed to get upload URL");
        return;
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      // 2) Upload image directly to Sevalla
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "image/jpeg",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        toast.error("Failed to upload image to storage");
        return;
      }

      // 3) Insert image into editor
      editor.chain().focus().setImage({ src: publicUrl }).run();
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    setIsLoading(true);
    const content = editor.getHTML();

    const submitFormData = new FormData();
    submitFormData.append("title", formData.title);
    submitFormData.append("description", formData.description);
    submitFormData.append("content", content);
    submitFormData.append("author_id", formData.author_id);
    submitFormData.append("is_published", formData.is_published.toString());
    submitFormData.append("seo_title", formData.seo_title);
    submitFormData.append("seo_description", formData.seo_description);
    submitFormData.append("keywords", JSON.stringify(keywords));

    if (formData.featured_image) {
      submitFormData.append("featured_image", formData.featured_image);
    }

    if (isEditing && blog) {
      submitFormData.append(
        "old_featured_image_url",
        blog.featuredImageUrl || ""
      );
    }

    try {
      let result;
      if (isEditing && blog) {
        result = await updateBlog(blog.id, submitFormData);
      } else {
        result = await createBlog(submitFormData);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Blog ${isEditing ? "updated" : "created"} successfully`);
        if (!isEditing) {
          // Reset form for new blog
          setFormData({
            title: "",
            description: "",
            author_id: "",
            is_published: false,
            seo_title: "",
            seo_description: "",
            featured_image: null,
          });
          setKeywords([]);
          editor.commands.clearContent();
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-8 w-8 p-0 ${
        isActive
          ? "bg-orange-500 text-white hover:bg-orange-600"
          : "text-gray-400 hover:text-white hover:bg-gray-700"
      }`}
    >
      {children}
    </Button>
  );

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
          </h1>
          <p className="text-gray-400">
            {isEditing
              ? "Update your blog post content and settings"
              : "Write and publish your blog post"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-br from-gray-900 to-black border border-orange-500/20">
              <TabsTrigger
                value="content"
                className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger
                value="metadata"
                className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <Settings className="w-4 h-4" />
                Metadata & SEO
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-400" />
                    Blog Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Editor Toolbar */}
                  <div className="space-y-2">
                    <Label className="text-gray-300 block">Content *</Label>
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-2">
                      <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b border-gray-600">
                        {/* Text Formatting */}
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().toggleBold().run()
                          }
                          isActive={editor.isActive("bold")}
                          title="Bold"
                        >
                          <Bold className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                          }
                          isActive={editor.isActive("italic")}
                          title="Italic"
                        >
                          <Italic className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                          }
                          isActive={editor.isActive("underline")}
                          title="Underline"
                        >
                          <UnderlineIcon className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                          }
                          isActive={editor.isActive("strike")}
                          title="Strikethrough"
                        >
                          <Strikethrough className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().toggleCode().run()
                          }
                          isActive={editor.isActive("code")}
                          title="Code"
                        >
                          <Code className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().toggleHighlight().run()
                          }
                          isActive={editor.isActive("highlight")}
                          title="Highlight"
                        >
                          <Highlighter className="w-4 h-4" />
                        </ToolbarButton>

                        <div className="w-px h-6 bg-gray-600 mx-1" />

                        {/* Headings */}
                        <ToolbarButton
                          onClick={() =>
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 1 })
                              .run()
                          }
                          isActive={editor.isActive("heading", { level: 1 })}
                          title="Heading 1"
                        >
                          <Heading1 className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 2 })
                              .run()
                          }
                          isActive={editor.isActive("heading", { level: 2 })}
                          title="Heading 2"
                        >
                          <Heading2 className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 3 })
                              .run()
                          }
                          isActive={editor.isActive("heading", { level: 3 })}
                          title="Heading 3"
                        >
                          <Heading3 className="w-4 h-4" />
                        </ToolbarButton>

                        <div className="w-px h-6 bg-gray-600 mx-1" />

                        {/* Lists */}
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                          }
                          isActive={editor.isActive("bulletList")}
                          title="Bullet List"
                        >
                          <List className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                          }
                          isActive={editor.isActive("orderedList")}
                          title="Numbered List"
                        >
                          <ListOrdered className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().toggleTaskList().run()
                          }
                          isActive={editor.isActive("taskList")}
                          title="Task List"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().toggleBlockquote().run()
                          }
                          isActive={editor.isActive("blockquote")}
                          title="Quote"
                        >
                          <Quote className="w-4 h-4" />
                        </ToolbarButton>

                        <div className="w-px h-6 bg-gray-600 mx-1" />

                        {/* Alignment */}
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().setTextAlign("left").run()
                          }
                          isActive={editor.isActive({ textAlign: "left" })}
                          title="Align Left"
                        >
                          <AlignLeft className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().setTextAlign("center").run()
                          }
                          isActive={editor.isActive({ textAlign: "center" })}
                          title="Align Center"
                        >
                          <AlignCenter className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() =>
                            editor.chain().focus().setTextAlign("right").run()
                          }
                          isActive={editor.isActive({ textAlign: "right" })}
                          title="Align Right"
                        >
                          <AlignRight className="w-4 h-4" />
                        </ToolbarButton>

                        <div className="w-px h-6 bg-gray-600 mx-1" />

                        {/* Media & Links */}
                        <ToolbarButton
                          onClick={() => {
                            const url = window.prompt("Enter link URL:");
                            if (url) {
                              editor
                                .chain()
                                .focus()
                                .setLink({ href: url })
                                .run();
                            }
                          }}
                          isActive={editor.isActive("link")}
                          title="Add Link"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() => fileInputRef.current?.click()}
                          title="Insert Image"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </ToolbarButton>

                        <div className="w-px h-6 bg-gray-600 mx-1" />

                        {/* History */}
                        <ToolbarButton
                          onClick={() => editor.chain().focus().undo().run()}
                          disabled={!editor.can().undo()}
                          title="Undo"
                        >
                          <Undo className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={() => editor.chain().focus().redo().run()}
                          disabled={!editor.can().redo()}
                          title="Redo"
                        >
                          <Redo className="w-4 h-4" />
                        </ToolbarButton>
                      </div>

                      <EditorContent editor={editor} />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Tip: You can drag & drop or paste images directly into the
                      editor
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Settings */}
                <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-orange-400" />
                      Basic Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Title */}
                    <div>
                      <Label
                        htmlFor="title"
                        className="text-gray-300 mb-2 block"
                      >
                        Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Enter blog title..."
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label
                        htmlFor="description"
                        className="text-gray-300 mb-2 block"
                      >
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief description of your blog post..."
                        rows={3}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                        required
                      />
                    </div>

                    {/* Author */}
                    <div>
                      <Label
                        htmlFor="author"
                        className="text-gray-300 mb-2 block"
                      >
                        Author *
                      </Label>
                      <Select
                        value={formData.author_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, author_id: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {authors.map((author) => (
                            <SelectItem
                              key={author.id}
                              value={author.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {author.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Featured Image */}
                    <div>
                      <Label
                        htmlFor="featured_image"
                        className="text-gray-300 mb-2 block"
                      >
                        Featured Image
                      </Label>
                      <Input
                        id="featured_image"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            featured_image: e.target.files?.[0] || null,
                          })
                        }
                        className="bg-gray-700 border-gray-600 text-white file:bg-orange-500 file:text-white file:border-0 file:rounded-md"
                      />
                      {blog?.featuredImageUrl && (
                        <p className="text-xs text-gray-500 mt-1">
                          Current: {blog.featuredImageUrl.split("/").pop()}
                        </p>
                      )}
                    </div>

                    {/* Publish Status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="is_published" className="text-gray-300">
                          Publish Status
                        </Label>
                        <p className="text-xs text-gray-500">
                          {formData.is_published
                            ? "Visible to public"
                            : "Save as draft"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <Switch
                          id="is_published"
                          checked={formData.is_published}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_published: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Settings */}
                <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Tag className="w-5 h-5 text-orange-400" />
                      SEO Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* SEO Title */}
                    <div>
                      <Label
                        htmlFor="seo_title"
                        className="text-gray-300 mb-2 block"
                      >
                        SEO Title
                      </Label>
                      <Input
                        id="seo_title"
                        value={formData.seo_title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seo_title: e.target.value,
                          })
                        }
                        placeholder="SEO optimized title..."
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.seo_title.length}/60 characters
                      </p>
                    </div>

                    {/* SEO Description */}
                    <div>
                      <Label
                        htmlFor="seo_description"
                        className="text-gray-300 mb-2 block"
                      >
                        SEO Description
                      </Label>
                      <Textarea
                        id="seo_description"
                        value={formData.seo_description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seo_description: e.target.value,
                          })
                        }
                        placeholder="Meta description for search engines..."
                        rows={3}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.seo_description.length}/160 characters
                      </p>
                    </div>

                    {/* Keywords */}
                    <div>
                      <Label className="text-gray-300 mb-2 block">
                        Keywords
                      </Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="Add keyword..."
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addKeyword())
                          }
                        />
                        <Button
                          type="button"
                          onClick={addKeyword}
                          variant="outline"
                          className="bg-gray-700 border-gray-600 text-orange-400 hover:bg-orange-700"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-orange-500/20 text-orange-300 border border-orange-500/30"
                          >
                            {keyword}
                            <X
                              className="w-3 h-3 ml-1 cursor-pointer hover:text-orange-100"
                              onClick={() => removeKeyword(keyword)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-orange-500/20 mt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isEditing ? "Update Blog" : "Create Blog"}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem 0;
          border-radius: 0.375rem;
          cursor: pointer;
        }

        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #f97316;
          outline-offset: 2px;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #6b7280;
          pointer-events: none;
          height: 0;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #f97316;
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: #d1d5db;
        }

        .ProseMirror code {
          background-color: #374151;
          color: #f9fafb;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }

        .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
          font-size: inherit;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
        }

        .ProseMirror li {
          margin: 0.25rem 0;
        }

        .ProseMirror .task-list {
          list-style: none;
          padding-left: 0;
        }

        .ProseMirror .task-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .ProseMirror .task-item input[type="checkbox"] {
          margin-top: 0.25rem;
          accent-color: #f97316;
        }

        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1.5rem 0 1rem 0;
          color: #f9fafb;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1.25rem 0 0.75rem 0;
          color: #f9fafb;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          color: #f9fafb;
        }

        .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.6;
          color: #e5e7eb;
        }

        .ProseMirror a {
          color: #fb923c;
          text-decoration: underline;
        }

        .ProseMirror a:hover {
          color: #fdba74;
        }
      `}</style>
    </div>
  );
}
