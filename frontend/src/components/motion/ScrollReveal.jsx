import { motion } from "framer-motion";

const defaultViewport = { once: true, margin: "-40px", amount: 0.2 };

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  y = 22,
  ...rest
}) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={defaultViewport}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
