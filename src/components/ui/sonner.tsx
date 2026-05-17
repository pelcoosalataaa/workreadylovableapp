import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      duration={3000}
      toastOptions={{
        style: {
          background: "#0e2538",
          borderLeft: "3px solid #7dedb8",
          border: "1px solid #1a3d58",
          borderLeftWidth: "3px",
          borderLeftColor: "#7dedb8",
          color: "#ffffff",
          fontSize: "13px",
          padding: "14px 20px",
          borderRadius: "8px",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
