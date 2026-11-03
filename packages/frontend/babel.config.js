// Utilisé uniquement par Jest (babel-jest) : le build CRA utilise sa propre config Babel.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};
