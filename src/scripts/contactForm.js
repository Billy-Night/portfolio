// Contact form: show the fields that fit the chosen reason, and send the form to
// /.netlify/functions/contact (which forwards it to Make).
// Used by src/components/contact/ContactForm.astro.

const clientFormReason = document.querySelector('#reason')
const clientFormProjectFields = document.querySelector('#form-project-fields')
const clientContactForm = document.querySelector('#contact-form')
const clientContactFormSeo = document.querySelector('#seo-objective-form')
const clientContactFormSeoBudget = document.querySelector('#SEO-budget-form')
const cFPrefTimWeb = document.querySelector('#pref-time-website')
const clientContFormWebBud = document.querySelector('#website-budget-form')
const cFPrefTimSeo = document.querySelector('#pref-time-seo')

const statusElPass = document.querySelector('.form-status-pass')
const statusElError = document.querySelector('.form-status-error')

if (clientFormReason) {
  clientFormReason.addEventListener('change', function () {
    const useChoice = clientFormReason.value
    if (useChoice !== 'general-question') {
      clientFormProjectFields.classList.remove('hide-element')
    } else {
      clientFormProjectFields.classList.add('hide-element')
    }
    if (useChoice !== 'seo') {
      // Show website options
      clientContFormWebBud.classList.replace('hide-element', 'form-group')
      cFPrefTimWeb.classList.replace('hide-element', 'form-group')
      // Hide SEO options
      clientContactFormSeo.classList.replace('form-group', 'hide-element')
      clientContactFormSeoBudget.classList.replace('form-group', 'hide-element')
      cFPrefTimSeo.classList.replace('form-group', 'hide-element')
    } else {
      // Hide website options
      clientContFormWebBud.classList.replace('form-group', 'hide-element')
      cFPrefTimWeb.classList.replace('form-group', 'hide-element')
      // Show SEO options
      clientContactFormSeo.classList.replace('hide-element', 'form-group')
      clientContactFormSeoBudget.classList.replace('hide-element', 'form-group')
      cFPrefTimSeo.classList.replace('hide-element', 'form-group')
    }
  })
}

if (clientContactForm) {
  //* NEW code test to hide MAKE API in Netlify functions
  clientContactForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)

    // Honeypot (client-side)
    try {
      if (formData.get('web-check') !== '') throw new Error('Bot detected')
    } catch (err) {
      console.error(err)
      return
    }

    // const seoFeatures = formData.getAll('seo-features[]')
    // formData.set('seo-features-joined', seoFeatures.join(', '))
    // console.log(formData)

    const payload = {
      formName: formData.get('form-name'),
      honeypot: formData.get('web-check'),

      name: formData.get('name'),
      email: formData.get('email'),
      reason: formData.get('reason'),
      message: formData.get('message'),

      business: formData.get('business') || null,
      url: formData.get('url') || null,

      seoFeatures: formData.getAll('seo-features[]'),
      seoBudget: formData.get('seo-budget') || null,
      seoTimeline: formData.get('seo-timeline') || null,

      webBudget: formData.get('web-budget') || null,
      webTimeline: formData.get('web-timeline') || null,
    }


    try {
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response
          .json()
          .catch(async () => await response.text())
        console.log('Function error:', response.status, err)
        throw new Error(
          typeof err === 'string' ? err : err.error || 'Unknown error',
        )
      }

      statusElError.classList.add('hide-element')
      statusElPass.classList.remove('hide-element')
      form.reset()
    } catch (err) {
      console.error(err)
      statusElPass.classList.add('hide-element')
      statusElError.classList.remove('hide-element')
    }
  })
}
