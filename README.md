# GitHub secrets viewer action

Provides a safe approach to reading GitHub secrets since they are not accessible after being set.

## How it works

This approach uses GPG, commonly used for signing commits in the Git community, to encrypt the
provided content.

A GPG private key will be generated on every invocation of this action. That private key is used in
conjunction with a public key you provide to encrypt the provided content. You may than access, and
remove, the output on disk however works for you.

The exact code GitHub will run can be audited at `dist/index.js`.

## Usage

```yaml
- uses: outdatedversion/github-secrets-viewer@v1
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

## Similar things

- Similar process with OpenSSL
  - Meir Gabay posted
    [a how-to article](https://meirg.co.il/2022/07/01/how-to-recover-secrets-from-github-actions/)
    on their website and
    [on GitHub Discussions](https://github.com/orgs/community/discussions/26277#discussioncomment-3251166)

## Wishlist

- Support protected keys
