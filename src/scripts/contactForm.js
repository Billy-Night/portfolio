// Contact form: show the fields that fit the chosen reason, and send the form to
// /.netlify/functions/contact (which forwards it to Make).
// Used by src/components/contact/ContactForm.astro.

const reasonField = document.querySelector('#reason')
const projectFields = document.querySelector('#form-project-fields')
const contactForm = document.querySelector('#contact-form')
const seoObjectiveField = document.querySelector('#seo-objective-form')
const seoBudgetField = document.querySelector('#SEO-budget-form')
const websiteTimelineField = document.querySelector('#pref-time-website')
const websiteBudgetField = document.querySelector('#website-budget-form')
const seoTimelineField = document.querySelector('#pref-time-seo')

const statusSuccess = document.querySelector('.form-status-pass')
const statusError = document.querySelector('.form-status-error')

if (reasonField) {
  reasonField.addEventListener('change', function () {
    const chosenReason = reasonField.value
    if (chosenReason !== 'general-question') {
      projectFields.classList.remove('hide-element')
    } else {
      projectFields.classList.add('hide-element')
    }
    if (chosenReason !== 'seo') {
      // Show website options
      websiteBudgetField.classList.replace('hide-element', 'form-group')
      websiteTimelineField.classList.replace('hide-element', 'form-group')
      // Hide SEO options
      seoObjectiveField.classList.replace('form-group', 'hide-element')
      seoBudgetField.classList.replace('form-group', 'hide-element')
      seoTimelineField.classList.replace('form-group', 'hide-element')
    } else {
      // Hide website options
      websiteBudgetField.classList.replace('form-group', 'hide-element')
      websiteTimelineField.classList.replace('form-group', 'hide-element')
      // Show SEO options
      seoObjectiveField.classList.replace('hide-element', 'form-group')
      seoBudgetField.classList.replace('hide-element', 'form-group')
      seoTimelineField.classList.replace('hide-element', 'form-group')
    }
  })
}

if (contactForm) {
  //* NEW code test to hide MAKE API in Netlify functions
  contactForm.addEventListener('submit', async (e) => {
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
        throw new Error(
          typeof err === 'string' ? err : err.error || 'Unknown error',
        )
      }

      statusError.classList.add('hide-element')
      statusSuccess.classList.remove('hide-element')
      form.reset()
    } catch (err) {
      console.error(err)
      statusSuccess.classList.add('hide-element')
      statusError.classList.remove('hide-element')
    }
  })
}
