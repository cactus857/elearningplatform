"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QRCodeCanvas } from "qrcode.react";
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
import {
  setupTwoFactorAuth,
  enableTwoFactorAuth,
} from "@/services/2fa.service";

interface TwoFactorAuthSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  code: z.string().min(6, "Please enter the 6-digit code."),
});

export function TwoFactorAuthSetupModal({
  isOpen,
  onClose,
  onSuccess,
}: TwoFactorAuthSetupModalProps) {
  const [setupData, setSetupData] = useState<{
    secret: string;
    uri: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (isOpen) {
      const fetchSetupData = async () => {
        setIsLoading(true);
        try {
          const data = await setupTwoFactorAuth();
          setSetupData(data);
        } catch (error) {
          toast.error("Failed to start 2FA setup", {
            description: getErrorMessage(error),
            position: "top-center",
          });
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      fetchSetupData();
    } else {
      setSetupData(null);
      form.reset();
    }
  }, [isOpen, onClose, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsVerifying(true);
    try {
      await enableTwoFactorAuth({ totpCode: values.code });
      toast.success("Two-Factor Authentication enabled successfully!", {
        position: "top-center",
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Verification failed", {
        description: getErrorMessage(error),
        position: "top-center",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Scan the QR code with your authenticator app, then enter the
            generated code below to verify.
          </DialogDescription>
        </DialogHeader>
        {isLoading && (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        )}
        {setupData && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 bg-white rounded-lg">
              <QRCodeCanvas value={setupData.uri} size={180} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Or enter this key manually:
              </p>
              <p className="font-mono bg-muted p-2 rounded-md text-center tracking-wider">
                {setupData.secret}
              </p>
            </div>

            {/* FORM NHẬP MÃ XÁC MINH */}
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
                    disabled={isVerifying}
                    className="w-full"
                  >
                    {isVerifying && <LoadingSpinner />}
                    Verify & Enable
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
