"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const editUserSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof editUserSchema>;

interface EditUserProps {
  user: {
    id: string;
    username: string;
    email: string;
  };
  isOpen?: boolean;
  onEdit?: (data: {
    id: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void> | void;
  onSave?: (data: any) => void;
  currentUserId?: string;
  onClose?: () => void;
}

export default function EditUserDialog({
  user,
  onEdit,
  onSave,
  currentUserId,
  onClose,
}: EditUserProps) {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canEdit = currentUserId ? user.id === currentUserId : true;
  
  const [editingDisabled, setEditingDisabled] = useState(true);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: user.username,
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setPending(true);
    setErrorMessage(null);
    const payload = {
      id: user.id,
      username: values.username,
      email: user.email, 
      password: values.password || "",
    };
    try {
      if (onEdit) await onEdit(payload);
      if (onSave) onSave(payload);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error editing user:", error);
      setErrorMessage(typeof error === 'string' ? error : "Ошибка при редактировании пользователя");
    }
    setPending(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-6">Редактировать пользователя</h2>
      {errorMessage && <p className="text-destructive text-center mb-4">{errorMessage}</p>}
      <form id="editUserForm" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username">Имя пользователя</Label>
          <Input 
            id="username" 
            {...register("username")} 
            disabled={!canEdit}
            className={errors.username ? "border-destructive" : ""}
          />
          {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input 
            id="password" 
            type="password" 
            {...register("password")} 
            disabled={!canEdit}
            className={errors.password ? "border-destructive" : ""}
            placeholder="Оставьте пустым, чтобы не менять"
          />
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>
        
        <Button 
          type="submit" 
          form="editUserForm" 
          className="w-full mt-6" 
          disabled={!canEdit || pending || editingDisabled}
        >
          {pending ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </form>
    </div>
  );
}
