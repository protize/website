import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileNav({ navItems = [] }) {
  const [open, setOpen] = useState(false);

  const BASE =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.BASE_URL) ||
    "/";

  const normalize = (path) => {
    if (!path) return "/";
    let p = path.startsWith("/") ? path : "/" + path;

    try {
      const u = new URL(p, window.location.origin);
      p = u.pathname;
    } catch {}

    if (BASE && BASE !== "/" && p.startsWith(BASE)) {
      p = p.slice(BASE.length - 1);
    }

    p = p.replace(/index\.html$/i, "");

    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);

    return p || "/";
  };

  const getCurrent = () => normalize(window.location.pathname);

  const [activePath, setActivePath] = useState("/");

  useEffect(() => {
    setActivePath(getCurrent());

    const onPop = () => setActivePath(getCurrent());
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
  }, []);

  const isActiveHref = (href) => {
    let targetPath = "/";
    try {
      targetPath = normalize(new URL(href, window.location.origin).pathname);
    } catch {
      targetPath = normalize(href);
    }

    return (
      activePath === targetPath ||
      (targetPath !== "/" && activePath.startsWith(targetPath + "/"))
    );
  };

  return (
    <div className="lg:hidden flex items-center relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle navigation"
        className="flex flex-col justify-center items-end w-8 h-8 gap-1.5 relative z-50"
      >
        <span
          className={`h-0.5 w-6 bg-black rounded-full transition-all duration-300 ${
            open ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`h-0.5 w-6 bg-black rounded-full transition-all duration-300 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`h-0.5 w-6 bg-black rounded-full transition-all duration-300 ${
            open ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />

            {/* panel */}
            <motion.div
              key="menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 18 }}
              className="fixed top-0 right-0 w-2/3 max-w-sm h-full bg-[#f7f7f7] shadow-2xl p-8 z-40 flex flex-col gap-6"
            >
              <ul className="flex flex-col space-y-2 text-base mt-10">
                {navItems.map((item) => {
                  const isActive = activePath === item.href;
                  return (
                    <li key={item.text}>
                      <a
                        href={item.href}
                        onClick={(e) => {
                          try {
                            const target = new URL(
                              item.href,
                              window.location.origin
                            ).pathname;
                            setActivePath(normalize(target));
                          } catch {
                            setActivePath(normalize(item.href));
                          }
                          setOpen(false);
                        }}
                        className={`block font-semibold transition-colors py-2 ${
                          isActive
                            ? "text-primary"
                            : "text-gray-800 hover:text-primary"
                        }`}
                      >
                        {item.text}
                      </a>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6">
                <a
                  href="/contact-us"
                  className="inline-flex px-6 py-3 rounded-full outline-none relative overflow-hidden border duration-300 ease-linear bg-primary text-white justify-center w-full text-center"
                  onClick={() => setOpen(false)}
                >
                  Contact Us
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
