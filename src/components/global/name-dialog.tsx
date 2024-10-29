import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import NameForm, { NameFormRef } from './name-form';
import useUserStore from '~/components/global/user-store';
import APP_ROUTES from '~/lib/constants/APP_ROUTES';

const NameDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<NameFormRef>(null);
  const router = useRouter();
  const { user } = useUserStore();

  useEffect(() => {
    const shouldShowDialog = 
      user !== null && 
      router.pathname !== APP_ROUTES.LANDING && 
      user.hasSetName === false; // Changed to false since we want to show when name hasn't been set

    console.log("Show dialog check:", {
      user: user !== null,
      notLanding: router.pathname !== APP_ROUTES.LANDING,
      hasSetName: user?.hasSetName,
      shouldShow: shouldShowDialog
    });

    setIsOpen(shouldShowDialog);
  }, [router.pathname, user]);

  const handleSubmit = async () => {
    try {
      await formRef.current?.submit();
      setIsOpen(false);
    } catch (error) {
      // Error handling is already managed by the form's toast messages
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Name details</DialogTitle>
          <DialogDescription>
            Please add a first and last name to continue
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <NameForm ref={formRef} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NameDialog;