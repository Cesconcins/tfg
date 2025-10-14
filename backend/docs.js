const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

module.exports = function mountDocs(app) {
  const openapiPath = path.join(__dirname, 'openapi.yaml');
  const spec = YAML.load(openapiPath);

  app.get('/openapi.json', (_req, res) => res.json(spec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
};