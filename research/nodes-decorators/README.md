# Node Modeling with TypeScript Decorators Research

This repository contains research code demonstrating an approach to modeling nodes in flow-based programming using TypeScript decorators. It's part of the ChainGraph project research, exploring alternatives to Langflow's Python-based node modeling system.

## Key Features

- Type-safe node definitions using TypeScript decorators
- Support for nested object structures
- Automatic schema generation for nodes
- Runtime metadata handling
- Support for both input and output ports
- Flexible port type system

## Example Usage

The research code includes a complete example of a UserProfile node with nested address structures:

```typescript
@FlowNode({
    type: 'UserProfileNode',
    category: 'Data Processing',
    title: 'User Profile Node',
})
class UserProfileNode {
    @Port({ direction: 'in', title: 'User Profile Input', type: 'object' })
    userProfile: UserProfile = new UserProfile()

    @Port({ direction: 'out', title: 'Processed User Profile', type: 'object' })
    processedProfile: UserProfile = new UserProfile()

    execute() {
        // Node logic implementation
    }
}
```

For the complete implementation, see [nodes-with-decorators-research.ts](./nodes-with-decorators-research.ts)

## Note

This is research code intended to explore and demonstrate concepts. The final implementation in ChainGraph may differ in details while maintaining the core approach of using decorators for node definition.