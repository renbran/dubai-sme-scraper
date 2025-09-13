---
name: Performance Issue
about: Report performance problems or optimization opportunities
title: '[PERFORMANCE] '
labels: ['performance', 'needs-investigation']
assignees: ''
---

## Performance Issue Description

**What performance problem are you experiencing?**
- [ ] Slow extraction speed
- [ ] High memory usage
- [ ] Timeout errors
- [ ] Rate limiting issues
- [ ] Other: ___________

## Environment Details

- **Actor Version**: [e.g., v1.4.0]
- **Platform**: [Apify Console / Local Development]
- **System**: [OS, RAM, CPU if local]

## Current Performance

**Extraction Speed**: [e.g., 5 businesses/minute]
**Memory Usage**: [e.g., 800MB peak]
**Categories Tested**: [number and examples]
**Results Per Category**: [e.g., 100]

## Configuration Used

```json
{
  "categories": ["example categories"],
  "maxResultsPerCategory": 100,
  "dataQualityLevel": "medium",
  "concurrency": {
    "maxConcurrency": 3,
    "requestDelay": 2000
  }
}
```

## Expected Performance

**What performance would you expect?**
- Target speed: [e.g., 15 businesses/minute]
- Target memory: [e.g., under 400MB]
- Target success rate: [e.g., 95%+]

## Logs and Metrics

**Error messages or warnings:**
```text
Paste relevant log messages here
```

**Performance metrics:**
- Total runtime: [e.g., 30 minutes]
- Businesses extracted: [e.g., 150]
- Failures: [e.g., 5%]

## Additional Context

- Time of day when issue occurred: [UTC]
- Specific business categories affected: [if any]
- Any recent changes to configuration: [Yes/No]