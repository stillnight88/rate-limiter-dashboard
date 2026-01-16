# Redis Architecture and Design Rationale

## Purpose of This Document

This document explains **why Redis is a mandatory dependency** in the Rate Limiter Admin Dashboard and how it is used to support real-time enforcement, monitoring, and configuration.

It is intended as a **technical design note** for engineers who want deeper insight into the system’s runtime behavior and trade-offs. The README provides a high-level overview; this document focuses on details.

---

## Problem Context

The system is responsible for enforcing API rate limits, blocking abusive clients, and providing near real-time visibility into request activity.

These requirements introduce several constraints:

* Very high read/write frequency (per request)
* Low tolerance for latency during request handling
* Shared state across multiple backend instances
* Automatic expiration of short-lived data (rate-limit windows, temporary bans)

Traditional application memory or disk-backed databases are not well-suited for these constraints.

---

## Why Redis

Redis is used as an **in-memory, shared state store** that sits alongside the API layer.

It provides:

* Sub-millisecond access to hot data
* Atomic operations for counters and updates
* Built-in support for expiring keys (TTL)
* Native data structures optimized for the system’s needs

These characteristics make Redis a practical choice for enforcing rate limits and firewall rules consistently across multiple servers.

---

## Redis Responsibilities in This System

### 1. Rate Limiting

Redis tracks per-IP request counts within fixed time windows.

* Each IP address is associated with a counter key
* The counter is incremented on every request
* Keys automatically expire when the window ends

This ensures that rate-limit state resets naturally without manual cleanup and remains consistent across all backend instances.

---

### 2. IP Blocking and Firewall Rules

Redis stores information about blocked or temporarily banned IP addresses.

* Firewall middleware checks Redis before processing requests
* Bans take effect immediately across all servers
* Temporary bans rely on TTLs for automatic expiration

This allows rapid response to abuse without waiting for database writes or application restarts.

---

### 3. Request Analytics (Time-Series Counters)

The system tracks request volume over time to support dashboard charts.

* Requests increment per-minute counters
* Each counter represents a specific time slice
* Historical counters expire automatically after a retention period

This approach enables efficient retrieval of recent activity without long-running database queries.

---

### 4. IP Activity Ranking

Redis sorted sets are used to rank IP addresses by request volume.

* Each IP has a score representing its activity
* Redis maintains ordering internally
* Top-N queries are efficient even with large datasets

This supports features such as identifying the most active or abusive IPs.

---

### 5. Live Configuration

Rate-limit configuration is stored in Redis rather than static files or environment variables.

* Admin changes are written to Redis
* New values are applied on subsequent requests
* No server restart is required

This enables rapid operational response when limits need adjustment.

---

### 6. Recent Request Logs

Redis lists are used to store a bounded set of recent request events.

* New entries are pushed to the head of the list
* Lists are trimmed automatically to a fixed size
* The admin dashboard reads from this list for recent activity

This avoids unbounded growth while keeping recent data readily available.

---

## Why Not Application Memory

Storing rate-limit or ban state in application memory would isolate state per server instance.

In a multi-instance setup:

* Each server would see only partial request counts
* Rate limits could be bypassed unintentionally
* Bans would not be enforced consistently

Redis provides a single source of truth that all instances can access.

---

## Why Not a Traditional Database

Disk-backed databases are optimized for durability and complex queries, not high-frequency counters.

Using a database for these responsibilities would introduce:

* Higher per-request latency
* Increased write contention under load
* Additional cleanup logic for expired data

Redis is better suited for ephemeral, high-throughput state that does not require long-term persistence.

---

## Trade-offs and Limitations

* Redis is a required runtime dependency
* Redis availability directly affects rate limiting and firewall enforcement
* The current setup assumes a single Redis instance

These trade-offs are accepted to prioritize correctness, simplicity, and real-time behavior at the current scale.

---

## Summary

Redis acts as the real-time backbone of the system.

It enables:

* Consistent rate limiting across servers
* Immediate IP ban enforcement
* Efficient analytics and dashboards
* Live configuration updates without downtime

Without Redis, these guarantees would be difficult to achieve reliably using application memory or a traditional database alone.