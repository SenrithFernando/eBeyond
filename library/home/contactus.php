<section class="contact-section">
  <div class="container contact-inner">
    <div class="row g-4 align-items-start">

      <!-- FORM -->
      <div class="col-lg-5 col-12">
        <h2 class="contact-title">How to reach us</h2>
        <p class="contact-subtitle">Lorem ipsum dolor sit amet, consectetur.</p>

        <!-- EmailJS is loaded and initialized dynamically by `js/contact-form.js`. -->
        <!-- Remove or adjust this comment if you prefer a static include. -->

        <form id="contactForm" method="post" class="contact-form mt-4">
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
          <!-- location: primary (Google Maps embed) -->
          <iframe id="eb-map-iframe"
            src="https://www.google.com/maps?q=eBEYONDS&output=embed"
            style="border:0; width:100%; height:100%; min-height:300px;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>

          <!-- fallback: OpenStreetMap embed (hidden by default) -->
          <div id="eb-map-fallback" style="display:none;">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?query=eBEYONDS&layer=mapnik"
              style="border:0; width:100%; height:400px; min-height:300px;"
              loading="lazy"></iframe>
            <div style="font-size:13px; color:#666; margin-top:8px;">
              Map provided by OpenStreetMap — <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener">OpenStreetMap</a>
            </div>
          </div>
        </div>

        <script>
          // Detect if Google Maps (maps.googleapis.com) was blocked by an extension
          // If blocked, show the OpenStreetMap fallback embed so users still see a map.
          (function(){
            // Wait a short time for scripts to load; if window.google.maps is undefined, assume blocked.
            function showFallback() {
              var iframe = document.getElementById('eb-map-iframe');
              var fallback = document.getElementById('eb-map-fallback');
              if (iframe && fallback) {
                iframe.style.display = 'none';
                fallback.style.display = 'block';
                console.warn('Google Maps appears blocked — showing OpenStreetMap fallback.');
              }
            }

            // Check for google.maps after 1.5s; if not present, fallback
            setTimeout(function(){
              if (typeof window.google === 'undefined' || typeof window.google.maps === 'undefined') {
                showFallback();
              }
            }, 1500);

            // Also hide fallback if user explicitly requests original (future extension)
          })();
        </script>
      </div>

    </div>
  </div>
</section>
