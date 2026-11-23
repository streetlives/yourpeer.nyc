import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "yourpeer.nyc-nextjs";

export const EditForm = () => (
  <Dialog open>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Service description</DialogTitle>
        <DialogDescription>
          Describe what this service offers, in plain language.
        </DialogDescription>
      </DialogHeader>
      <textarea
        className="text-black text-sm placeholder:text-gray-500 rounded-md w-full resize-none border-gray-400"
        rows={4}
        defaultValue="Hot lunch served Monday to Friday. No ID or referral needed."
      />
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
