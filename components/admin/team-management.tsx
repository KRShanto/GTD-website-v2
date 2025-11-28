"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Pencil, GripVertical, Trash2 } from "lucide-react";
import { deleteTeamMember } from "@/actions/team/delete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderTeamMembers } from "@/actions/team/update";
import { Team } from "@/lib/generated/prisma/client";

// Draggable card for team member
function DraggableTeamMemberCard({
  member,
  listeners,
  attributes,
  setNodeRef,
  style,
  onEdit,
  onDelete,
  loading,
}: any) {
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-white">{member.name}</h3>
            <p className="text-sm text-gray-400">{member.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/team/edit/${member.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                onClick={onEdit}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              disabled={loading}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <div
              {...listeners}
              className="cursor-grab text-gray-400 hover:text-orange-400"
              style={{ display: "flex", alignItems: "center" }}
            >
              <GripVertical className="w-5 h-5" />
            </div>
          </div>
        </div>
        <img
          src={member.imageUrl}
          alt={member.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <p className="text-sm text-gray-300 line-clamp-3">{member.bio}</p>
      </div>
    </div>
  );
}

export default function TeamManagement({
  initialMembers,
}: {
  initialMembers: Team[];
}) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Team[]>(initialMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberToDelete, setMemberToDelete] = useState<Team | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const handleDelete = async (member: Team) => {
    setMemberToDelete(member);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    setLoading(true);
    try {
      const result = await deleteTeamMember(memberToDelete.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setMembers((prev) =>
        prev.filter((member) => member.id !== memberToDelete.id)
      );
      toast.success("Team member deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete team member");
    } finally {
      setLoading(false);
      setMemberToDelete(null);
    }
  };

  // DnD-kit sortable wrapper for each card
  function SortableTeamMember({ member, onEdit, onDelete, loading }: any) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: member.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : undefined,
      opacity: isDragging ? 0.7 : 1,
    };
    return (
      <DraggableTeamMemberCard
        member={member}
        listeners={listeners}
        attributes={attributes}
        setNodeRef={setNodeRef}
        style={style}
        onEdit={onEdit}
        onDelete={onDelete}
        loading={loading}
      />
    );
  }

  // Drag end handler
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = members.findIndex((m) => m.id === active.id);
    const newIndex = members.findIndex((m) => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newMembers = arrayMove(members, oldIndex, newIndex);
    setMembers(newMembers);
    await reorderTeamMembers(newMembers.map((m) => m.id));
    toast.success("Team order updated");
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={() => setMemberToDelete(null)}
      >
        <AlertDialogContent className="bg-gray-900 border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Team Member
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete {memberToDelete?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
              onClick={() => setMemberToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search by name or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={members.map((m) => m.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member, index) => (
                <SortableTeamMember
                  key={index}
                  member={member}
                  onEdit={() => {}}
                  onDelete={() => handleDelete(member)}
                  loading={loading}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {filteredMembers.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No team members found
          </p>
        )}
      </div>
    </>
  );
}
