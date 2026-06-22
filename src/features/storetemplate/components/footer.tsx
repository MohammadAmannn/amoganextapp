
/**
 * Footer component.
 *
 * This component renders the footer of the application.
 * 
 * @returns {JSX.Element}
 */
function Footer() {
  return (
    <footer className="border-t border-border/60 py-8 bg-background text-foreground">
      {/* Footer text */}
      <p className="text-center text-sm leading-loose text-muted-foreground">
        {/* Copyright symbol */}
        &copy; {new Date().getFullYear()} Store. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;