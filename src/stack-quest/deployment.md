# Stack-Quest Deployment & CI/CD

## GitHub Pages Deployment

### Automatic Deployment
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Pages
        uses: actions/configure-pages@v3
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v1
        with:
          path: '.'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

## Deployment Process

1. **Code Push**: Developer pushes to main branch
2. **Trigger**: GitHub Actions workflow starts
3. **Build**: No build step needed (static site)
4. **Deploy**: Files uploaded to GitHub Pages
5. **Live**: Site available immediately

## Configuration

### GitHub Pages Settings
- **Source**: Deploy from branch (main)
- **Branch**: / (root)
- **Custom Domain**: Optional
- **HTTPS**: Automatically enabled

### Repository Structure
```
stack-quest/
├── index.html
├── script.js
├── styles.css
├── Random-Questions/
│   ├── linux.md
│   ├── aws.md
│   └── ...
├── Challenge/
│   ├── devops-challenges.md
│   └── ...
└── .github/
    └── workflows/
        └── deploy.yml
```

## Custom Domain Setup

### DNS Configuration
1. Add CNAME record pointing to GitHub Pages
2. Configure custom domain in repository settings
3. Enable HTTPS (automatic)
4. Wait for DNS propagation

### Example DNS Records
```
Type: CNAME
Name: www
Value: username.github.io
```

## Rollback Strategy

### Version Control
- **Git History**: All versions tracked
- **Branch Strategy**: Feature branches for changes
- **Tagging**: Tag releases for easy rollback
- **Revert Commits**: Quick rollback via git revert

### Rollback Process
1. Identify problematic commit
2. Revert commit or checkout previous version
3. Push to main branch
4. GitHub Actions redeploys automatically

## Monitoring Deployment

### GitHub Actions Logs
- **Workflow Runs**: View deployment history
- **Build Logs**: Check for errors
- **Deployment Status**: Monitor deployment progress

### Health Checks
```bash
# Check site availability
curl -I https://username.github.io/stack-quest/

# Verify content loading
curl https://username.github.io/stack-quest/Random-Questions/linux.md
```

## Best Practices

1. **Test Locally**: Verify changes before pushing
2. **Review Changes**: Use pull requests for review
3. **Monitor Deployments**: Check GitHub Actions status
4. **Version Control**: Commit frequently with clear messages
5. **Documentation**: Keep README updated
