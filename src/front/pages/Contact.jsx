// src/front/pages/Contact.jsx

import React, { useState, useEffect } from "react";
import isotipo from "../assets/img/isotipo.png";
import contactImage from "../assets/img/contact-image.jpg";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import Accordion from "react-bootstrap/Accordion";
import Collapse from "react-bootstrap/Collapse";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

export const Contact = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus(null);

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(() => {
        setStatus({ type: "success", message: "Message sent successfully!" });
        setFormData({ fullname: "", email: "", subject: "", message: "" });
      })
      .catch((err) => {
        console.error("Failed to send message:", err);
        setStatus({ type: "danger", message: "Something went wrong. Please try again." });
      });
  };

  return (
    <div className="vh-100 w-100 d-flex flex-lg-row flex-column align-items-stretch overflow-hidden">
      <div className="w-100 w-lg-50 h-100">
        <motion.img
          src={contactImage}
          srcSet={`${contactImage} 1x, ${contactImage} 2x`}
          alt="contact illustration"
          className="img-fluid w-100 h-100"
          style={{ objectFit: "cover" }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      </div>

      <div className="w-100 w-lg-50 h-100 d-flex flex-column align-items-center justify-content-start p-4 bg-black text-white overflow-auto">
        {isMobile && (
          <Button
            variant="outline-light"
            onClick={() => setOpen(!open)}
            aria-controls="contact-form"
            aria-expanded={open}
            className="mb-3"
          >
            {open ? "Hide Form" : "Show Form"}
          </Button>
        )}

        <Collapse in={open || !isMobile}>
          <div id="contact-form" className="w-100" style={{ maxWidth: "500px" }}>
            <motion.form
              onSubmit={handleSubmit}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-4">
                <img src={isotipo} alt="GitWise logo" width="60" />
                <h3 className="mt-2 fw-bold">Contact Us</h3>
                <p className="text-white-50 small">
                  Send us a message and we'll get back to you as soon as possible.
                </p>
              </div>

              {status && (
                <Alert variant={status.type} className="text-center">
                  {status.message}
                </Alert>
              )}

              {["fullname", "email", "subject"].map((field) => (
                <div className="form-group mb-3 text-start" key={field}>
                  <label className="text-white text-capitalize">
                    {field === "fullname" ? "Full name" : field}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    className="form-control bg-dark text-white border-secondary"
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    required
                  />
                </div>
              ))}

              <div className="form-group mb-3 text-start">
                <label className="text-white">Your message</label>
                <textarea
                  className="form-control bg-dark text-white border-secondary"
                  rows="3"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-gitwise w-100 fw-bold">Send</button>

              <div className="text-white text-center mt-4 small">
                <p className="mb-1">\ud83d\udccd GitWise HQ — Colombia, Uruguay & Venezuela</p>
                <div className="d-flex justify-content-center gap-3">
                  <a href="https://github.com/gitwise-ai" target="_blank" rel="noreferrer" className="text-white">
                    <i className="fab fa-github fa-lg"></i>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-white">
                    <i className="fab fa-linkedin fa-lg"></i>
                  </a>
                  <a href="mailto:hello@gitwise.ai" className="text-white">
                    <i className="fas fa-envelope fa-lg"></i>
                  </a>
                </div>
              </div>

              <div className="text-white text-center mt-4">
                <div className="row g-4">
                  {["Users", "Projects", "Commits"].map((label, i) => (
                    <div className="col-md-4" key={label}>
                      <h2 className="fw-bold">
                        <CountUp end={[4321, 987, 27650][i]} duration={3} separator="," />
                      </h2>
                      <p className="text-uppercase small text-white">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="my-4">
                  <h4 className="fw-bold mb-3">FAQs</h4>
                  <Accordion defaultActiveKey="0" flush>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Why choose GitWise?</Accordion.Header>
                      <Accordion.Body>
                        GitWise is built for developers, by developers. Open source, collaborative and powerful.
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>Can I submit feedback?</Accordion.Header>
                      <Accordion.Body>
                        Absolutely! Reach out to us through this form or join our community on GitHub.
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              </div>
            </motion.form>
          </div>
        </Collapse>
      </div>
    </div>
  );
};