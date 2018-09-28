import spec from '../../../openapi.json'

const docs = async () => {
  return {
    headers: {
      'Content-Type': 'text/html',
    },
    data: `
<html>
  <head>
    <link rel="icon" href="https://raw.githubusercontent.com/knowledge/knowledge-assets/master/knw-token.png?token=AA3gD63sraDPaOeN-bZZjxLaB-TkN6Ygks5ayomCwA%3D%3D">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@3.13.1/swagger-ui.css"></link>
    <title>${spec.info.title}</title>
  </head>

  <body style="margin: 0">
    <div id="swagger-ui"></div>

    <script src="//unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>

    <script>
    window.onload = function() {
      SwaggerUIBundle({
        spec: ${JSON.stringify(spec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis
        ]
      })
    }
    </script>
  </body>
</html>
`
  }
}

export default docs
