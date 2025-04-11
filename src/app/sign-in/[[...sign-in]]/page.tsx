"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

// Create a custom error handler to suppress the specific XState warning
function suppressXStateWarning() {
  const originalConsoleWarn = console.warn;
  console.warn = function(...args) {
    // Filter out the specific XState warning
    if (args[0] && typeof args[0] === 'string' && 
        args[0].includes('Custom actions should not call `assign()`')) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

export default function SignInPage() {
  // Apply warning suppression on component mount
  useEffect(() => {
    suppressXStateWarning();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md border">
        <CardHeader className="text-center p-6">
          <CardTitle className="text-xl font-bold">
            Leadbee keywords 🔑
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <SignIn.Root>
            <SignIn.Step name="start">
              <div className="space-y-4">
                <Clerk.Field name="identifier">
                  <Clerk.Label className="block text-sm font-medium mb-2">
                    Электронная почта
                  </Clerk.Label>
                  <Clerk.Input
                    type="email"
                    placeholder="Введите эл. почту или имя пользователя"
                    className="w-full p-2 border rounded"
                  />
                  <Clerk.FieldError className="mt-1 text-xs" />
                </Clerk.Field>
                <SignIn.Action submit className="w-full" asChild>
                  <Button type="submit" className="w-full">
                    Продолжить
                  </Button>
                </SignIn.Action>
              </div>
            </SignIn.Step>

            <SignIn.Step name="verifications">
              <SignIn.Strategy name="email_code">
                <div className="space-y-4">
                  <h1 className="text-xl font-bold text-center">
                    Проверьте вашу почту
                  </h1>
                  <p className="text-center text-sm">
                    Мы отправили код на <SignIn.SafeIdentifier />.
                  </p>
                  <Clerk.Field name="code">
                    <Clerk.Label className="block text-sm font-medium mb-2">
                      Код
                    </Clerk.Label>
                    <Clerk.Input
                      placeholder="Введите код"
                      className="w-full p-2 border rounded"
                    />
                    <Clerk.FieldError className="mt-1 text-xs" />
                  </Clerk.Field>
                  <div className="flex flex-col gap-2">
                    <SignIn.Action submit className="w-full" asChild>
                      <Button type="submit" className="w-full">
                        Продолжить
                      </Button>
                    </SignIn.Action>
                    <SignIn.Action navigate="start" asChild>
                      <Button type="button" className="w-full border rounded p-2">
                        Изменить логин
                      </Button>
                    </SignIn.Action>
                  </div>
                </div>
              </SignIn.Strategy>

              <SignIn.Strategy name="password">
                <div className="space-y-4">
                  <h1 className="text-xl font-bold text-center">
                    Введите пароль
                  </h1>
                  <Clerk.Field name="password">
                    <Clerk.Label className="block text-sm font-medium mb-2">
                      Пароль
                    </Clerk.Label>
                    <Clerk.Input
                      type="password"
                      placeholder="Введите пароль"
                      className="w-full p-2 border rounded"
                    />
                    <Clerk.FieldError className="mt-1 text-xs" />
                  </Clerk.Field>
                  <div className="flex flex-col gap-2">
                    <SignIn.Action submit className="w-full" asChild>
                      <Button type="submit" className="w-full">
                        Продолжить
                      </Button>
                    </SignIn.Action>
                    <SignIn.Action navigate="forgot-password" className="w-full" asChild>
                      <Button type="button" className="w-full border rounded p-2">
                        Забыли пароль?
                      </Button>
                    </SignIn.Action>
                    <SignIn.Action navigate="start" className="w-full" asChild>
                      <Button type="button" className="w-full border rounded p-2">
                        Изменить логин
                      </Button>
                    </SignIn.Action>
                  </div>
                </div>
              </SignIn.Strategy>

              <SignIn.Strategy name="reset_password_email_code">
                <div className="space-y-4">
                  <h1 className="text-xl font-bold text-center">
                    Проверьте вашу почту
                  </h1>
                  <p className="text-center text-sm">
                    Мы отправили код на <SignIn.SafeIdentifier />.
                  </p>
                  <Clerk.Field name="code">
                    <Clerk.Label className="block text-sm font-medium mb-2">
                      Код
                    </Clerk.Label>
                    <Clerk.Input
                      placeholder="Введите код"
                      className="w-full p-2 border rounded"
                    />
                    <Clerk.FieldError className="mt-1 text-xs" />
                  </Clerk.Field>
                  <div className="flex flex-col gap-2">
                    <SignIn.Action submit className="w-full" asChild>
                      <Button type="submit" className="w-full">
                        Продолжить
                      </Button>
                    </SignIn.Action>
                    <SignIn.Action navigate="start" className="w-full" asChild>
                      <Button type="button" className="w-full border rounded p-2">
                        Изменить логин
                      </Button>
                    </SignIn.Action>
                  </div>
                </div>
              </SignIn.Strategy>
            </SignIn.Step>

            <SignIn.Step name="forgot-password">
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-center">
                  Забыли пароль?
                </h1>
                <div className="flex flex-col gap-2">
                  <SignIn.SupportedStrategy name="reset_password_email_code" asChild>
                    <Button type="button" className="w-full border rounded p-2">
                      Сбросить пароль
                    </Button>
                  </SignIn.SupportedStrategy>
                  <SignIn.Action navigate="previous" asChild>
                    <Button type="button" className="w-full border rounded p-2">
                      Назад
                    </Button>
                  </SignIn.Action>
                  <SignIn.Action navigate="start" asChild>
                    <Button type="button" className="w-full border rounded p-2">
                      Изменить логин
                    </Button>
                  </SignIn.Action>
                </div>
              </div>
            </SignIn.Step>

            <SignIn.Step name="reset-password">
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-center">
                  Сброс пароля
                </h1>
                <Clerk.Field name="password">
                  <Clerk.Label className="block text-sm font-medium mb-2">
                    Новый пароль
                  </Clerk.Label>
                  <Clerk.Input
                    type="password"
                    placeholder="Введите новый пароль"
                    className="w-full p-2 border rounded"
                  />
                  <Clerk.FieldError className="mt-1 text-xs" />
                </Clerk.Field>
                <Clerk.Field name="confirmPassword">
                  <Clerk.Label className="block text-sm font-medium mb-2">
                    Подтвердите пароль
                  </Clerk.Label>
                  <Clerk.Input
                    type="password"
                    placeholder="Подтвердите новый пароль"
                    className="w-full p-2 border rounded"
                  />
                  <Clerk.FieldError className="mt-1 text-xs" />
                </Clerk.Field>
                <div className="flex flex-col gap-2">
                  <SignIn.Action submit className="w-full" asChild>
                    <Button type="submit" className="w-full">
                      Сбросить пароль
                    </Button>
                  </SignIn.Action>
                  <SignIn.Action navigate="start" className="w-full" asChild>
                    <Button type="button" className="w-full border rounded p-2">
                      Изменить логин
                    </Button>
                  </SignIn.Action>
                </div>
              </div>
            </SignIn.Step>
          </SignIn.Root>
        </CardContent>
      </Card>
    </div>
  );
}