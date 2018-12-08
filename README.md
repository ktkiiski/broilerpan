# BroilerPan

**DEPRECATION NOTICE: This project has been integrated to [BroilerKit](https://github.com/ktkiiski/broilerkit.git) in favor of `npx`! Please check out that main project instead!**

**BroilerPan** is a command line interface for **bootstrapping and deploying scalable, production-ready web apps**! It works with projects built with **[BroilerKit](https://github.com/ktkiiski/broilerkit.git) framework!**

The command line interface includes commands to deploy your web app to [Amazon Web Services cloud platform](https://aws.amazon.com/), with minimal setup and very low costs! The hosting is almost free (but not completely free) on low-traffic sites.

(**Disclaimer:** By using this utility you are taking the responsibility for any incurring expenses!)

For the complete list of features check out the [BroilerKit]([BroilerKit](https://github.com/ktkiiski/broilerkit.git))!

## What do I need?

To use this utility, you need the following:

- Your own **domain** for your web app. You can buy one, e.g, from [GoDaddy](https://www.godaddy.com/domains).
- An [Amazon Web Services](https://aws.amazon.com/) account. You can get started with [AWS Free Tier](https://aws.amazon.com/free/).

## Installing

Install the command line utility:

```bash
npm i -g broilerpan
```

After this you can use the `broil` command. To get the overview of the available commands, run `broil help`:

```
$ broil help
Commands:
  init [directory]      Bootstrap your project with Broilerplate template.           [aliases: pull]
  deploy <stage>        Deploy the web app for the given stage.
  undeploy <stage>      Deletes the previously deployed web app.
  logs <stage> [since]  Print app logs.
  compile <stage>       Compile the web app.                                        [aliases: build]
  preview <stage>       Preview the changes that would be deployed.
  describe <stage>      Describes the deployed resources.
  serve [stage]         Run the local development server.

Options:
  --appConfigPath  Path to the app configuration                        [string] [default: "app.ts"]
  --debug          Compile assets for debugging                                            [boolean]
  --no-color       Print output without colors                                             [boolean]
  --help           Show help                                                               [boolean]
  --version        Show version number                                                     [boolean]
```

## Creating a web app

You can easily bootstrap a new web app:

```bash
broil init myapp
```

This will create a folder `myapp` and initialize it as a GIT repository, if not already initialized. Then it will apply the [Broilerplate template](https://github.com/ktkiiski/broilerplate.git) to your project. It will then also install node dependencies for you!

If you have already created a GIT repository for you app, just run this in the directory:

```
broil init
```

**NOTE:** If installing node dependencies fails on OSX [you may try to install libpng with Homebrew](https://github.com/tcoopman/image-webpack-loader#libpng-issues).


## Configuring the app

After bootstrapping your project, you should add the metadata to the `package.json` file, for example, `name`, `author`, `description`.

Then you should change the configuration in `app.ts` according to your web app's needs.

- `name`: A distinct name of your app. Recommended to be in lower case and separate words with dashes, because the name will be used in Amazon resource names and internal host names.
- `stages`: Configuration for each different stage that your app has. By default there are `dev` stage for a development version and `prod` stage for the production version. You should change the `siteDomain` and `assetsDomain` to the domain names that you would like to use for each stage. There is also a special stage `local` that is used for the locally run development server.

## Running locally

To run the app locally, start the local HTTP server and the build watch process:

```bash
broil serve
```

Then navigate your browser to the website address as defined in your `local` stage configuration, which is http://localhost:1111/ by default!

The web page is automatically reloaded when the app is re-built.


## Deployment

### Prerequisities

#### Set up AWS credentials

First, create a user and an access key from [AWS Identity and Access Management Console](https://console.aws.amazon.com/iam).

Then you need to set up your AWS credentials to your development machine.
This can be done with [`aws-cli` command line tool](https://github.com/aws/aws-cli), which you may need to [install first](http://docs.aws.amazon.com/cli/latest/userguide/installing.html):

```bash
# Install if not already installed
pip install awscli
# Optional: enable command line completion
complete -C aws_completer aws
# Configure your credentials
aws configure
```


### Running deployment

Deployments are run with the following command:

```bash
broil deploy <stage>
```

For example, to deploy the development version to the `dev` stage:

```bash
broil deploy dev
```

To deploy the production version to the `prod` stage:

```bash
broil deploy prod
```

The deployment will automatically [create a Hosted Zone for Amazon Route53](http://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html#root-domain-walkthrough-switch-to-route53-as-dnsprovider) for your custom domain. If you are using other domain name provider, such as GoDaddy, then you need to set up the DNS records for your domain! Details are printed by the deployment command!

**IMPORTANT:** When deploying for the first time, you will receive email for confirming the certificate for the domain names!
The deployment continues only after you approve the certificate!

The deployment will build your app files, and then upload them to Amazon S3 buckets.

The assets (JavaScript, CSS, images) are uploaded first. Their names will contain hashes, so they won't conflict with existing files.
They will be cached infinitely with HTTP headers.
The HTML files are uploaded last and they are cached for a short time.
