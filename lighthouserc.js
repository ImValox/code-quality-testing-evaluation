module.exports = {
  ci: {
    collect: {
      staticDistDir: './packages/frontend/build',
      // Application monopage : toutes les routes renvoient index.html, sinon seul /index.html
      // (qui ne correspond à aucune route React, donc une page vide) serait audité.
      isSinglePageApplication: true,
      url: ['/login', '/register', '/products', '/users', '/add-product'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.8 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
