"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from '@/components/UserTable';
import { Eye, EyeOff } from 'lucide-react';

// Define the sign up schema
const signUpSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type FormValues = z.infer<typeof signUpSchema>;

export interface AddUserDialogProps {
  onClose?: () => void;
  onAddUser?: (newUser: User) => void;
}

export default function AddUserDialog({ onClose, onAddUser }: AddUserDialogProps) {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setErrorMessage(null);
    setPending(true);
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const result = await response.json();
      if (response.ok && result.user) {
        console.log("User created:", result.user);
        const createdUser = result.user;
        const newUser = {
          id: createdUser.id,
          username: createdUser.username || "",
          email: createdUser.email || ""
        };
        if (onAddUser) onAddUser(newUser);
        if (onClose) onClose();
      } else {
        console.error("Ошибка при создании пользователя:", result.error);
        if (result.details) {
          let details;
          try {
            details = typeof result.details === 'string' ? JSON.parse(result.details) : result.details;
          } catch (e) {
            details = result.details;
          }
          if (details.errors && Array.isArray(details.errors)) {
            const passwordError = details.errors.find((err: any) => err.meta && err.meta.paramName === 'password');
            if (passwordError) {
              if (passwordError.code === "form_password_pwned") {
                passwordError.message = "Пароль обнаружен в утечке данных. Для безопасности аккаунта, пожалуйста, используйте другой пароль.";
              }
              setError("password", { type: "manual", message: passwordError.message });
            } else {
              setErrorMessage(result.error || "Ошибка при создании пользователя.");
            }
          } else {
            setErrorMessage(result.error || "Ошибка при создании пользователя.");
          }
        } else {
          setErrorMessage(result.error || "Ошибка при создании пользователя.");
        }
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setErrorMessage(typeof error === 'string' ? error : "Error creating user");
    }
    setPending(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-6">
        Добавить нового пользователя
      </h2>
      {errorMessage && <p className="text-destructive text-center mb-4">{errorMessage}</p>}
      <form id="addUserForm" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username">Имя пользователя</Label>
          <Input 
            id="username" 
            placeholder="Введите имя пользователя" 
            {...register("username")} 
            className={errors.username ? "border-destructive" : ""}
          />
          {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Введите email" 
            {...register("email")} 
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Введите пароль" 
              {...register("password")} 
              className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>
        
        <Button type="submit" className="w-full mt-6" disabled={pending}>
          {pending ? "Загрузка..." : "Добавить пользователя"}
        </Button>
      </form>
    </div>
  );
}
