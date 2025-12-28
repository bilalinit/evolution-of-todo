# Default Backend Structure

When you run `uv init --package backend`, the following minimal structure is created:

```
backend/
├── .gitignore
├── .python-version
├── pyproject.toml
├── README.md
└── src/
    └── backend/
        ├── __init__.py
        └── py.typed    # (May vary by version, sometimes absent)
```

No generic `tests/` folder is created by default in newer versions unless explicitly configured or added manually later.
