const path = require('path');
const glob = require('glob');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");


module.exports = {
    entry: {
        vendor: './src/scripts/vendor.js',
        main: './src/index.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'js/[name].js'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                main: {
                    chunks: "initial",
                    minChunks: 2,
                    maxInitialRequests: 5, // The default limit is too small to showcase the effect
                    minSize: 0 // This is example is too small to create commons chunks
                },
                vendor: {
                    test: /node_modules/,
                    chunks: "initial",
                    name: "vendor",
                    priority: 10,
                    enforce: true
                }
            }
        },
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.pug$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            minimize: true,
                            removeComments: false,
                            collapseWhitespace: false
                        }
                    },
                    {
                        loader: 'pug-html-loader',
                    }
                ]
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    // "style-loader", // style nodes from js strings
                    { loader: 'css-loader', options: { minimize: true } },
                    {
                        loader: 'postcss-loader', // Run post css actions
                        options: {
                            ident: 'postcss',
                            plugins: (loader) => { // post css plugins, can be exported to postcss.config.js
                                return [
                                    require('precss')(),
                                    require('autoprefixer')(),
                                    require("css-mqpacker")()
                                ];
                            }
                        }
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'images/',
                            publicPath: url => `../images/${url}`
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                progressive: true,
                                quality: 65
                            },
                            // optipng.enabled: false will disable optipng
                            optipng: {
                                enabled: false,
                            },
                            pngquant: {
                                quality: '65-90',
                                speed: 4
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            // the webp option will enable WEBP
                            webp: {
                                quality: 75
                            }
                        },
                    },
                ],
            },
            {
                test: /\.(ttf|eot|woff(2)?)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/',
                        publicPath: url => `../fonts/${url}`
                    }
                }],
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebPackPlugin({
            template: './src/index.pug',
            filename: './index.html'
        }),
        new HtmlWebPackPlugin({
            template: './src/pages/about.pug',
            filename: './about.html'
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'styles/[name].css',
            chunkFilename: '[id].css'
        }),
        new PurifyCSSPlugin({
            // Give paths to parse for rules. These should be absolute!
            paths: glob.sync(path.join(__dirname, './src/**/*.pug')),
            styleExtensions: ['.scss', '.css'],
            moduleExtensions: ['.pug', '.html']
        })
    ]
};
