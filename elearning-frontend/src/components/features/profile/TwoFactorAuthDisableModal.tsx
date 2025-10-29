"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { getErrorMessage } from "@/utils/error-message";
import { disableTwoFactorAuth } from "@/services/2fa.service";
import { useAuth } from "@/hooks/use-auth";
import api from "@/utils/api";
import { API_ENDPOINT } from "@/constants/endpoint";

interface TwoFactorAuthDisableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  code: z.string().min(6, "Please enter the 6-digit code."),
});

export function TwoFactorAuthDisableModal({
  isOpen,
  onClose,
  onSuccess,
}: TwoFactorAuthDisableModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (isOpen && user?.email) {
      const handleSendCode = async () => {
        setIsLoading(true);
        try {
          await api.post(API_ENDPOINT.SEND_OTP, {
            email: user.email,
            type: "DISABLE_2FA",
          });
          toast.info("Verification code sent!", {
            description: `A code has been sent to ${user.email}`,
            position: "top-center",
          });
        } catch (error) {
          toast.error("Failed to send code", {
            description: getErrorMessage(error),
          });
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      handleSendCode();
    } else if (!isOpen) {
      form.reset();
    }
  }, [isOpen, user, form, onClose]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsDisabling(true);
    try {
      await disableTwoFactorAuth({ code: values.code });
      toast.success("Two-Factor Authentication disabled successfully!", {
        position: "top-center",
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to disable 2FA", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            For your security, please enter the verification code sent to your
            email to confirm this action.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6 pt-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        {...field}
                        containerClassName="justify-center"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDisabling}
                  className="w-full"
                >
                  {isDisabling && <LoadingSpinner />}
                  Confirm & Disable
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
