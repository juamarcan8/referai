name: Feature Request
description: Suggest a new feature or improvement
title: "[FEATURE] "
labels: [enhancement]
assignees: []

body:
  - type: textarea
    id: description
    attributes:
      label: Describe the feature
      description: What do you want to see added or changed?
    validations:
      required: true

  - type: textarea
    id: motivation
    attributes:
      label: Why is this feature needed?
      description: Explain the value or motivation behind it.
    validations:
      required: false

  - type: input
    id: related
    attributes:
      label: Related issues or context
      placeholder: #123, etc.
    validations:
      required: false
