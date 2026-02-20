# Phase 19: Real‑Time Collaboration Layer Architecture Plan

## Overview
This architecture implements a real‑time collaborative editing system using CRDT (Conflict‑Free Replicated Data Types) with presence tracking and conflict resolution. The system enables multiple users/devices to edit documents simultaneously with automatic synchronization and conflict resolution.

## Core Principles
1. **Conflict‑Free**: CRDT ensures eventual consistency without manual conflict resolution
2. **Real‑Time**: WebSocket‑based communication for instant updates
3. **Presence Awareness**: Track active users, cursors, and selection ranges
4. **Modular Design**: Each subsystem ≤250 lines, with clear interfaces
5. **Type‑Safe**: Full TypeScript support with comprehensive type definitions

## Architecture Components

### 1. CRDT Layer (crdt/)
**Purpose**: Provide conflict‑free replicated data types for collaborative editing

**Components**:
- `CrdtEngine`: Main engine for CRDT operations (apply, merge, generate timestamps)
- `CrdtDocument`: Document representation with version vectors and operation history
- `CrdtOperation`: Operation types and transformation logic
- `CrdtTimestamp`: Logical timestamps (Lamport clocks) for ordering

**Key Algorithms**:
- **Lamport Clocks**: Logical timestamps for causal ordering
- **Operation Transformation**: Transform operations to maintain consistency
- **Version Vectors**: Track document versions across replicas

### 2. Presence Layer (presence/)
**Purpose**: Track active users, devices, and their current state

**Components**:
- `PresenceTracker`: Manages user sessions and device connections
- `PresenceState`: Type definitions for presence data
- `PresenceBroadcaster`: Broadcasts presence updates to all connected clients

**Features**:
- User identification (name, avatar, color)
- Cursor position tracking
- Selection range visualization
- Device type detection (desktop, mobile, tablet)
- Activity status (active, idle, away)

### 3. Conflict Layer (conflict/)
**Purpose**: Detect and resolve conflicts when they occur

**Components**:
- `ConflictDetector`: Identifies conflicting operations
- `ConflictResolver`: Applies resolution strategies
- `ResolutionStrategies`: Implements resolution algorithms

**Resolution Strategies**:
1. **Last‑Write‑Wins**: Most recent operation wins (default for simple conflicts)
2. **Operational Transform**: Transform operations to preserve both changes
3. **Manual Resolution**: Flag conflicts for user intervention
4. **Priority‑Based**: User roles determine precedence

### 4. Real‑Time Layer (realtime/)
**Purpose**: Handle real‑time communication and synchronization

**Components**:
- `RealtimeSyncEngine`: Main synchronization engine
- `WebSocketManager`: WebSocket connection lifecycle
- `MessageHandler`: Message parsing and routing

**Communication Protocol**:
```
Client → Server: { type: 'operation', data: CrdtOperation, timestamp }
Server → Client: { type: 'sync', data: CrdtDocument, presence: PresenceState }
Client → Client: { type: 'presence', data: PresenceUpdate }
```

### 5. Integration Layer (integration/)
**Purpose**: Bridge between collaboration layer and existing editor

**Components**:
- `EditorCollaborationAdapter`: Adapts editor events to collaboration operations
- `CollaborationUI`: UI components for presence visualization
- `ConflictUI`: UI for manual conflict resolution

## Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Editor UI     │───▶│  Collaboration  │───▶│   CRDT Engine   │
│                 │    │    Adapter      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presence UI   │◀───│ PresenceTracker │◀───│  Realtime Sync  │
│                 │    │                 │    │     Engine      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Conflict UI    │◀───│ ConflictResolver│◀───│   Supabase      │
│                 │    │                 │    │   (Storage)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Integration Points

### With Existing Editor (Phase 18)
- **Event Mapping**: Convert editor events to CRDT operations
- **State Synchronization**: Sync editor state with CRDT document
- **UI Integration**: Show presence indicators in editor UI

### With Supabase (Phase 18)
- **Real‑Time Subscriptions**: Use Supabase real‑time for WebSocket communication
- **Presence Storage**: Store presence data in Supabase presence tables
- **Document Storage**: Persist CRDT documents in Supabase database

### With Sync Engine (Phase 18)
- **Operation Queue**: Integrate with existing SyncEngine operation queue
- **Conflict Handling**: Use SyncEngine for offline conflict detection
- **State Persistence**: Leverage existing storage mechanisms

## Implementation Sequence

### Phase 1: Foundation (Current)
1. Create CRDT core module
2. Implement basic operation types
3. Set up logical timestamp system

### Phase 2: Communication
1. Implement WebSocket manager
2. Create real‑time sync engine
3. Set up message protocol

### Phase 3: Presence
1. Implement presence tracking
2. Create presence broadcaster
3. Add UI components for presence

### Phase 4: Conflict Resolution
1. Implement conflict detection
2. Add resolution strategies
3. Create conflict UI

### Phase 5: Integration
1. Create editor collaboration adapter
2. Integrate with existing editor
3. Add comprehensive tests

## Technical Constraints

### File Size Limits
- No file > 250 lines (strict)
- Each module must export via index.ts
- Clear separation of concerns

### Performance Requirements
- Operation latency < 100ms
- Presence updates < 500ms
- Memory usage < 50MB per document

### Scalability
- Support up to 100 concurrent users per document
- Handle documents up to 10,000 operations
- Efficient operation compression

## Testing Strategy

### Unit Tests
- CRDT operation correctness
- Conflict resolution logic
- Presence tracking accuracy

### Integration Tests
- Editor ↔ Collaboration integration
- Real‑time synchronization
- Supabase connectivity

### End‑to‑End Tests
- Multi‑user editing scenarios
- Network failure recovery
- Conflict resolution workflows

## Success Metrics
1. **Correctness**: No data loss in collaborative editing
2. **Performance**: Real‑time updates within 100ms
3. **Usability**: Intuitive presence and conflict UI
4. **Reliability**: Handle network failures gracefully
5. **Scalability**: Support large documents and many users

## Risk Mitigation

### Technical Risks
- **CRDT Complexity**: Start with simple text CRDT, expand gradually
- **Network Issues**: Implement robust reconnection logic
- **Performance**: Profile early, optimize critical paths

### Integration Risks
- **Editor Compatibility**: Create adapter layer for abstraction
- **State Synchronization**: Use existing SyncEngine as foundation
- **UI Complexity**: Incremental feature rollout

## Next Steps
1. Implement CRDT core module (CrdtEngine.ts)
2. Create type definitions for collaboration system
3. Set up basic WebSocket communication
4. Integrate with existing editor events

---
*Architecture Version: 1.0*
*Last Updated: 2026‑02‑19*
*Phase: 19 - Real‑Time Collaboration Layer*