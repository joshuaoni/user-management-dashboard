"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import AddUserModal from "./AddUserModal";
import UsersTable from "./UsersTable";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import { User } from "../../../types/types";
import { updateUser, deleteUser, createUser } from "../../../actions/actions";

interface DashboardContentProps {
  initialData: {
    data: {
      users: User[];
    };
    totalPages: number;
    total: number;
  };
}

export default function DashboardContent({
  initialData,
}: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const currentPage = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("search", value);
    params.set("page", "1");
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleRoleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("role", value);
    params.set("page", "1");
    router.push(`/dashboard?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleEdit = async (formData: FormData) => {
    try {
      await updateUser(selectedUser!._id, formData);
      toast.success("User updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update user");
      throw error;
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleAddUser = async (formData: FormData) => {
    try {
      await createUser(formData);
      toast.success("User added successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to add user");
      throw error;
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Users ({initialData.total})
          </h3>
          {user?.role === "admin" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add User
            </button>
          )}
        </div>
        <SearchBar
          searchQuery={search}
          selectedRole={role}
          loading={false}
          onSearchChange={handleSearchChange}
          onRoleChange={handleRoleChange}
        />
      </div>

      <UsersTable
        users={initialData.data.users}
        currentUser={user}
        onEdit={(user) => {
          setSelectedUser(user);
          setIsEditModalOpen(true);
        }}
        onDelete={(user) => {
          setSelectedUser(user);
          setIsDeleteModalOpen(true);
        }}
      />

      {initialData.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={initialData.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {selectedUser && (
        <>
          <EditUserModal
            user={selectedUser}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            onSave={handleEdit}
          />
          <DeleteUserModal
            user={selectedUser}
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }}
            onDelete={() => {
              handleDelete(selectedUser._id);
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }}
          />
        </>
      )}

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddUser}
      />
    </div>
  );
}
