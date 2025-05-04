export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  profilePhoto?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface EditUserModalProps extends ModalProps {
  user: User;
  onSave: (formData: FormData) => Promise<void>;
}

export interface DeleteUserModalProps extends ModalProps {
  user: User;
  onDelete: () => void;
}

export interface AddUserModalProps extends ModalProps {
  onSave: (formData: FormData) => Promise<void>;
}
