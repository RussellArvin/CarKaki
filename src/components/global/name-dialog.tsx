import React, { useRef } from 'react';
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

interface NameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const NameDialog = ({ open, onOpenChange, onSuccess }: NameDialogProps) => {
  const formRef = useRef<NameFormRef>(null);

  const handleSubmit = async () => {
      await formRef.current?.submit(); // Submit the form
      onSuccess?.(); // Call success callback if provided
      onOpenChange(false); // Close the dialog after successful submission
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Name</DialogTitle>
          <DialogDescription>
            Make changes to your profile name here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <NameForm ref={formRef} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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