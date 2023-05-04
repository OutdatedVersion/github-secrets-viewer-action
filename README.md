# GitHub secrets viewer action

Encrypts the provided input with GPG.

## Usage

```yaml
- uses: outdatedversion/github-secrets-viewer
  id: viewer
  with:
    gpg-public-key: ${{ vars.GPG_PUBLIC_KEY }}
    secrets: |
      accessToken=${{ secrets.ACCESS_TOKEN }}
      password=${{ secrets.PASSWORD }}

- uses: actions/upload-artifact@v3
  with:
    name: secrets
    path: ${{ steps.viewer.outputs.path }}
```

## Support

Tested against:

- Node v16
- `ubuntu-22.04`
