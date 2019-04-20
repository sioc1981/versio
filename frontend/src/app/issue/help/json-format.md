The file must provide an array of Issue structure.

```javascript
[
    {
        // if there is a parent reference
        // not currently used
        globalReference: string,
        // a simple description / the issue title
        description: string,
        // the mantis or the jira key
        reference: string,
        // container is case-sensitive
        container: 'JIRA' | 'MANTIS'
    }, {
        ...
    }, ...
]
```


