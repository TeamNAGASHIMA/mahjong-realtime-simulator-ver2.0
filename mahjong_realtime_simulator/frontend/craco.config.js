const BundleTracker = require('webpack-bundle-tracker');
const path = require('path');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new BundleTracker({
          path: path.resolve(__dirname, 'build'), // 出力先ディレクトリ (frontend/build)
          filename: 'webpack-stats.json',        // ファイル名
        }),
      ],
    },
    configure: (webpackConfig, { env, paths }) => {
      // CRAのビルド出力先をデフォルトの 'build' から変更しない場合は特に不要。
      // もし出力先を変更する場合は、paths.appBuild を変更し、
      // DjangoのSTATICFILES_DIRSやWEBPACK_LOADERの設定も合わせる必要がある。

      // publicPath をDjangoの STATIC_URL と合わせる必要がある場合がある。
      // CRAのデフォルトでは、本番ビルド時に homepage の設定や環境変数 PUBLIC_URL を見る。
      // 通常、Djangoテンプレート内で {% static ... %} を使うため、
      // React側での publicPath は相対パス ('./' や '') または絶対パス ('/') で問題ないことが多い。
      // webpack-bundle-tracker が出力するパスは、Djangoが解釈できる形にする。
      // 例えば、DjangoのSTATIC_URLが '/static/' なら、
      // webpack-stats.json内のpublicPathも '/static/' になっていると扱いやすい。
      // CRAのビルドはデフォルトで publicPath を賢く設定してくれるので、
      // 多くの場合、明示的な変更は不要。
      // webpackConfig.output.publicPath = '/static/'; // 例: 必要なら設定

      // CRAでは、ファイル名にハッシュが含まれる。
      // webpack-bundle-tracker はそのハッシュ付きファイル名を記録する。

    return webpackConfig;
    },
  },
  // CRAの開発サーバー (craco start) とDjango開発サーバーを併用する場合、
  // プロキシ設定などが必要になることがあるが、この統合方法では、
  // ReactをビルドしてDjangoから配信するので、CRAの開発サーバーは直接使わないことが多い。
  // もしCRAの開発サーバーでHMRを使いつつDjangoと連携したい場合は、より複雑な設定 (プロキシなど) が必要。
};