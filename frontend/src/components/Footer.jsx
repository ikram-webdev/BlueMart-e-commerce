function Footer() {
  const services = [
    { title: "Fast Shipping", text: "Shipped in 1-3 days" },
    { title: "Free Returns", text: "Free 7 days return" },
    { title: "Payment On Delivery", text: "Cash on delivery option" },
    { title: "Customer Support", text: "Phone and email assistance" },
  ];

  const customerLinks = ["Contact Us", "Delivery Info", "FAQs", "BlueMart Loyalty"];
  const infoLinks = ["About Us", "Return & Refund", "Privacy Policy", "Terms & Conditions", "Careers"];

  return (
    <footer className="site-footer naheed-footer">
      <section className="footer-feature-strip">
        <div className="container footer-feature-grid">
          {services.map((item) => (
            <article key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="footer-main-dark">
        <div className="container footer-columns">
          <div>
            <h4>BlueMart</h4>
            <p>BlueMart Head Office, Commerce Block, Your City</p>
            <p>BlueMart Pickup Point, Central Market, Your Area</p>
            <p>+880 1700-000000</p>
            <p>Support: 7 Days a Week, 9:00am - 10:00pm</p>
            <div className="footer-social-row">
              <span>FB</span><span>IG</span><span>X</span><span>IN</span><span>YT</span>
            </div>
          </div>

          <div>
            <h4>Customer Services</h4>
            {customerLinks.map((link) => (
              <p key={link}>{link}</p>
            ))}
          </div>

          <div>
            <h4>Information</h4>
            {infoLinks.map((link) => (
              <p key={link}>{link}</p>
            ))}
          </div>

          <div className="footer-newsletter-col">
            <h4>Subscribe Newsletter</h4>
            <p>Get the latest offers and promotions!</p>
            <div className="footer-newsletter-row">
              <input type="email" placeholder="Enter your email" />
              <button type="button">Subscribe</button>
            </div>
            <div className="footer-store-buttons">
              <button type="button">Google Play</button>
              <button type="button">App Store</button>
            </div>
          </div>
        </div>
      </section>

      <section className="footer-bottom-strip">
        <div className="container footer-bottom-inner">
          <p>Copyright © {new Date().getFullYear()} BlueMart. All rights reserved.</p>
          <div className="footer-payment-row">
            <span>HBL</span><span>VISA</span><span>MasterCard</span><span>EasyPaisa</span><span>COD</span>
          </div>
        </div>
      </section>
    </footer>
  );
}

export default Footer;
