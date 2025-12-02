<section class="contact-section">
  <div class="container contact-inner">
    <div class="row g-4 align-items-start">

      <!-- FORM -->
      <div class="col-lg-5 col-12">
        <h2 class="contact-title">How to reach us</h2>
        <p class="contact-subtitle">Lorem ipsum dolor sit amet, consectetur.</p>

        <form id="contactForm" method="post" action="php/contact-form.php" class="contact-form mt-4">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label contact-label">First Name*</label>
              <input type="text" name="first_name" class="form-control contact-input" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label contact-label">Last Name*</label>
              <input type="text" name="last_name" class="form-control contact-input" required>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label contact-label">Email*</label>
            <input type="email" name="email" class="form-control contact-input" required>
          </div>

          <div class="mb-3">
            <label class="form-label contact-label">Telephone</label>
            <input type="tel" name="telephone" class="form-control contact-input">
          </div>

          <div class="mb-2">
            <label class="form-label contact-label">Message</label>
            <textarea name="message" class="form-control contact-input" rows="3" required></textarea>
          </div>

          <p class="contact-required">*Required fields</p>

          <div class="form-check mb-3">
            <input class="form-check-input contact-check" type="checkbox" name="agreed_terms" id="termsCheck" required>
            <label class="form-check-label contact-check-label" for="termsCheck">
              I agree to the <a href="#" class="contact-link">Terms &amp; Conditions</a>
            </label>
          </div>

          <button type="submit" class="btn contact-submit">SUBMIT</button>
          <div id="formMessage" class="mt-3" style="display: none;"></div>
        </form>
      </div>

      <!--  MAP -->
      <div class="col-lg-7 col-12">
        <div class="map-wrapper">
          <!-- location -->
          <iframe
            src="https://www.google.com/maps?q=eBEYONDS&output=embed"
            style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>

    </div>
  </div>
</section>
