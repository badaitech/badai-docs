### WIP: Subject to change

# Part 1: Introduction to ChainGraph Nodes

## What is a Node in ChainGraph?

A node in ChainGraph represents a processing unit that can receive data through input ports, perform operations on that data, and output results through output ports. Think of nodes as building blocks that can be connected together to create complex data processing workflows.

Each node is a TypeScript class that inherits from `BaseNode` and can be decorated with metadata to describe its purpose, inputs, and outputs. Nodes are the fundamental units of computation in ChainGraph, allowing you to create modular and reusable components.

## Basic Node Structure

Here's a simple example of a basic node:

```typescript
import { BaseNode, Input, Node, Output, PortString } from '@chaingraph/types'

@Node({
  type: 'GreetingNode',
  title: 'Greeting Node',
  category: 'text',
  description: 'Creates a greeting message',
})
export class GreetingNode extends BaseNode {
  @Input()
  @PortString()
  name: string = ''

  @Output()
  @PortString()
  greeting: string = ''

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    // Node logic goes here
    return {
      status: 'completed',
      startTime: context.startTime,
      endTime: new Date(),
      outputs: new Map(),
    }
  }
}
```

Let's break down the key components:

1. **Node Decorator**: The `@Node` decorator provides metadata about the node:

    - `type`: A unique identifier for the node type
    - `title`: Display name for the node
    - `category`: Groups similar nodes together
    - `description`: Explains the node's purpose

2. **BaseNode Inheritance**: All nodes must extend `BaseNode` to inherit basic node functionality:

   ```typescript
   export class YourNode extends BaseNode {
     // Your node implementation
   }
   ```

3. **Ports**: Nodes communicate through ports. Each port is decorated with:
    - `@Input()` or `@Output()` to specify the port direction
    - A port type decorator (e.g., `@PortString()`, `@PortNumber()`) to specify the data type

## Understanding Ports and Data Flow

Ports are the interfaces through which nodes communicate. They have several important characteristics:

### Port Direction

```typescript
@Input()  // Marks a port as an input
@PortString()
inputData: string = ''

@Output() // Marks a port as an output
@PortString()
outputData: string = ''
```

### Port Types

ChainGraph supports various port types:

```typescript
// Basic types
@PortString()  // For string data
@PortNumber()  // For numeric data
@PortBoolean() // For boolean data

// Complex types
@PortArray()   // For arrays
@PortObject()  // For objects
@PortEnum()    // For enumerated values
```

### Optional Port Configuration

Ports can be configured with additional metadata:

```typescript
@Input()
@PortString({
  description: 'Enter your name',
  defaultValue: 'Guest',
  optional: true
})
name: string = 'Guest'
```

This is just the beginning of what you can do with ChainGraph nodes. In the next sections, we'll dive deeper into:

- Creating more complex nodes
- Working with different port types
- Configuring port behavior
- Handling data transformation
- Best practices for node design

# Part 2: Getting Started with Nodes

## Creating Your First Node

Let's start with creating a fully functional node. We'll create a text transformation node as an example.

```typescript
import type { ExecutionContext, NodeExecutionResult } from '@chaingraph/types'
import {
  BaseNode,
  Description,
  Input,
  Node,
  Optional,
  Output,
  PortString,
  Required,
} from '@chaingraph/types'

@Node({
  type: 'TextTransformNode',
  title: 'Text Transform',
  category: 'text',
  description: 'Transforms input text based on different options',
})
export class TextTransformNode extends BaseNode {
  @Input()
  @Required()
  @Description('The text to transform')
  @PortString()
  text: string = ''

  @Input()
  @Optional()
  @Description('Prefix to add to the text')
  @PortString({
    defaultValue: '',
  })
  prefix: string = ''

  @Input()
  @Optional()
  @Description('Suffix to add to the text')
  @PortString({
    defaultValue: '',
  })
  suffix: string = ''

  @Output()
  @Description('The transformed text')
  @PortString()
  result: string = ''

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    // Transform the text
    this.result = `${this.prefix}${this.text}${this.suffix}`

    return {
      status: 'completed',
      startTime: context.startTime,
      endTime: new Date(),
      outputs: new Map([['result', this.result]]),
    }
  }
}
```

Let's break down the key concepts in this example:

### Node Class Structure

1. **Imports**

   ```typescript
   import type { ExecutionContext, NodeExecutionResult } from '@chaingraph/types'
   import { BaseNode, Node } from '@chaingraph/types'
   ```

   Always import the necessary types and base classes from `@chaingraph/types`.

2. **Node Decorator**

   ```typescript
   @Node({
     type: 'TextTransformNode',  // Unique identifier
     title: 'Text Transform',     // Display name
     category: 'text',           // Grouping category
     description: '...',         // Detailed description
   })
   ```

   The `@Node` decorator provides essential metadata about your node.

3. **Class Definition**
   ```typescript
   export class TextTransformNode extends BaseNode {
     // Node implementation
   }
   ```
   Always extend `BaseNode` to inherit core node functionality.

### Defining Ports

Ports are class properties decorated with port decorators. There are two main aspects to configuring ports:

1. **Direction Decorators**

   ```typescript
   @Input()  // For input ports
   @Output() // For output ports
   ```

2. **Port Type Decorators**
   ```typescript
   @PortString()
   @PortNumber()
   @PortBoolean()
   // etc.
   ```

### Port Configuration Helpers

ChainGraph provides several helper decorators to enhance port configuration:

```typescript
@Description('Detailed description of the port')
@Required()    // Makes the port required
@Optional()    // Makes the port optional
@Name('Custom Port Name')
@Id('custom-port-id')
@DefaultValue('default value')
```

Example of combined decorators:

```typescript
@Input()
@Required()
@Description('Primary input text')
@PortString({
  defaultValue: '',
  metadata: {
    'ui:placeholder': 'Enter text here'
  }
})
text: string = ''
```

### Default Values

There are two ways to specify default values:

1. **In the Port Decorator**

   ```typescript
   @PortString({
     defaultValue: 'default text'
   })
   ```

2. **Using Class Property Assignment**
   ```typescript
   @PortString()
   text: string = 'default text'
   ```

The recommended approach is to use both for clarity:

```typescript
@PortString({
  defaultValue: 'default text'
})
text: string = 'default text'
```

### Adding Metadata

You can add custom metadata to ports for UI rendering or other purposes:

```typescript
@PortString({
  metadata: {
    'ui:widget': 'textarea',
    'ui:placeholder': 'Enter long text here',
    'ui:rows': 4
  }
})
longText: string = ''
```

### Basic Port Types Overview

1. **String Port**

   ```typescript
   @PortString()
   text: string = ''
   ```

2. **Number Port**

   ```typescript
   @PortNumber()
   count: number = 0
   ```

3. **Boolean Port**
   ```typescript
   @PortBoolean()
   enabled: boolean = false
   ```

### A More Complete Example

Here's a more comprehensive example showing various port configurations:

```typescript
@Node({
  type: 'TextProcessingNode',
  title: 'Text Processing',
  category: 'text',
  description: 'Advanced text processing with multiple options',
})
export class TextProcessingNode extends BaseNode {
  @Input()
  @Required()
  @Description('The main text to process')
  @PortString({
    metadata: {
      'ui:widget': 'textarea',
      'ui:placeholder': 'Enter your text here'
    }
  })
  inputText: string = ''

  @Input()
  @Optional()
  @Description('Maximum length of the output text')
  @PortNumber({
    defaultValue: 100,
    metadata: {
      'ui:min': 0,
      'ui:max': 1000,
      'ui:step': 10
    }
  })
  maxLength: number = 100

  @Input()
  @Optional()
  @Description('Enable uppercase transformation')
  @PortBoolean({
    defaultValue: false
  })
  uppercase: boolean = false

  @Output()
  @Description('The processed text')
  @PortString()
  outputText: string = ''

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    let result = this.inputText

    // Apply transformations
    if (this.uppercase) {
      result = result.toUpperCase()
    }

    // Apply length limit
    if (result.length > this.maxLength) {
      result = result.substring(0, this.maxLength)
    }

    this.outputText = result

    return {
      status: 'completed',
      startTime: context.startTime,
      endTime: new Date(),
      outputs: new Map([['outputText', this.outputText]]),
    }
  }
}
```

This example demonstrates:

- Multiple input and output ports
- Different port types
- Optional and required ports
- Custom metadata for UI rendering
- Default values
- Port descriptions

In the next section, we'll dive deeper into more complex port types and their configurations.

# Part 3: Working with Advanced Port Types

## Complex Data Structures with Object Ports

One of the most powerful features in ChainGraph is the ability to create complex data structures using object ports. Let's start with defining a custom object structure.

### Creating Object Schemas

First, you need to define your object structure using the `@PortObjectSchema` decorator:

```typescript
import {
  Description,
  PortArray,
  PortNumber,
  PortObjectSchema,
  PortString
} from '@chaingraph/types'

@PortObjectSchema({
  description: 'Represents a user address',
})
export class Address {
  @PortString({
    description: 'Street address'
  })
  street: string = ''

  @PortString({
    description: 'City name'
  })
  city: string = ''

  @PortString({
    description: 'Country code',
    defaultValue: 'US'
  })
  country: string = 'US'
}

@PortObjectSchema({
  description: 'Represents a user profile',
})
export class UserProfile {
  @PortString({
    description: 'User\'s full name'
  })
  name: string = ''

  @PortNumber({
    description: 'User\'s age'
  })
  age: number = 0

  @PortObject({
    description: 'User\'s primary address',
    defaultValue: new Address()
  })
  address: Address = new Address()

  @PortArray({
    description: 'User\'s email addresses',
    elementConfig: {
      kind: PortKindEnum.String,
      defaultValue: ''
    }
  })
  emails: string[] = []

  constructor(data?: Partial<UserProfile>) {
    if (data) {
      Object.assign(this, data)
    }
  }
}
```

### Using Object Ports in Nodes

Now you can use these object structures in your nodes:

```typescript
@Node({
  type: 'UserProfileProcessor',
  title: 'User Profile Processor',
  category: 'user-management',
  description: 'Processes user profile data',
})
export class UserProfileProcessor extends BaseNode {
  // Method 1: Infer schema from field value
  @Input()
  @PortObject()
  inputProfile: UserProfile = new UserProfile()

  // Method 2: Infer schema from field type
  @Input()
  @PortObject()
  optionalProfile?: UserProfile

  // Method 3: Explicit schema specification
  @Input()
  @PortObject({
    schema: UserProfile,
  })
  thirdProfile?: UserProfile

  // Method 4: Using default value
  @Input()
  @PortObject({
    defaultValue: new UserProfile({
      name: 'Default User',
      age: 25
    })
  })
  defaultProfile?: UserProfile

  @Output()
  @PortObject()
  processedProfile: UserProfile = new UserProfile()

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    // Process profiles...
    return {
      status: 'completed',
      startTime: context.startTime,
      endTime: new Date(),
      outputs: new Map(),
    }
  }
}
```

## Working with Array Ports

ChainGraph provides several ways to work with array ports, from simple to complex configurations.

### Simple Array Ports

```typescript
@Node({
  type: 'ArrayProcessor',
  title: 'Array Processor',
})
export class ArrayProcessor extends BaseNode {
  // Simple string array
  @Input()
  @PortStringArray()
  strings?: string[]

  // Simple number array
  @Input()
  @PortArrayNumber()
  numbers?: number[]

  // Array of objects
  @Input()
  @PortArrayObject(UserProfile)
  users?: UserProfile[]
}
```

### Multi-dimensional Arrays

For handling multi-dimensional arrays, use the `@PortArrayNested` decorator:

```typescript
@Node({
  type: 'MatrixProcessor',
  title: 'Matrix Processor',
})
export class MatrixProcessor extends BaseNode {
  // 2D array of strings
  @Input()
  @PortArrayNested(2, {
    kind: PortKindEnum.String,
    defaultValue: ''
  })
  matrix?: string[][]

  // 3D array of numbers
  @Input()
  @PortArrayNested(3, {
    kind: PortKindEnum.Number,
    defaultValue: 0
  })
  cube?: number[][][]

  // 2D array of user profiles
  @Input()
  @PortArrayNested(2, {
    kind: UserProfile,
  })
  userGroups?: UserProfile[][]
}
```

### Custom Array Configuration

For more complex array configurations:

```typescript
@Input()
@PortArray({
  elementConfig: {
    kind: PortKindEnum.Object,
    schema: UserProfile,
    defaultValue: new UserProfile()
  },
  defaultValue: [],
  validation: {
    minItems: 1,
    maxItems: 10
  }
})
users: UserProfile[] = []
```

## Enum Ports

Enum ports allow you to create ports with predefined options. There are several ways to define enum ports:

### String Enum

```typescript
@Node({
  type: 'ColorProcessor',
  title: 'Color Processor',
})
export class ColorProcessor extends BaseNode {
  @Input()
  @PortStringEnum(['Red', 'Green', 'Blue'])
  color: string = 'Red'
}
```

### Number Enum

```typescript
@Input()
@PortNumberEnum([1, 2, 3, 5, 8, 13])
fibonacci: string = '1'  // Note: The value is the string ID of the selected option
```

### Object Enum

```typescript
// Define the options
const userStatusOptions = {
  active: new UserStatus('Active'),
  inactive: new UserStatus('Inactive'),
  pending: new UserStatus('Pending'),
}

type UserStatusOptionId = keyof typeof userStatusOptions

@Node({
  type: 'StatusProcessor',
  title: 'Status Processor',
})
export class StatusProcessor extends BaseNode {
  @Input()
  @PortEnumFromObject(userStatusOptions)
  status: UserStatusOptionId = 'active'
}
```

### TypeScript Enum

```typescript
enum Direction {
  Up = 'Up',
  Down = 'Down',
  Left = 'Left',
  Right = 'Right',
}

@Node({
  type: 'DirectionProcessor',
  title: 'Direction Processor',
})
export class DirectionProcessor extends BaseNode {
  @Input()
  @PortEnumFromTypeScriptEnum(Direction)
  direction: Direction = Direction.Up
}
```

# Part 4: Stream Ports and Advanced Port Configurations

## Working with Stream Ports

Stream ports are special ports that allow continuous data flow between nodes. They're particularly useful for handling real-time data, events, or large datasets that need to be processed incrementally.

### Basic Stream Port Usage

```typescript
import {
  BaseNode,
  Input,
  MultiChannel,
  Node,
  Output,
  PortKindEnum,
  PortStreamInput,
  PortStreamOutput
} from '@chaingraph/types'

@Node({
  type: 'DataStreamProcessor',
  title: 'Data Stream Processor',
  category: 'streams',
  description: 'Processes streaming data',
})
export class DataStreamProcessor extends BaseNode {
  @Input()
  @PortStreamInput({
    valueType: {
      kind: PortKindEnum.String,
      defaultValue: '',
    }
  })
  inputStream: MultiChannel<string> = new MultiChannel<string>()

  @Output()
  @PortStreamOutput({
    valueType: {
      kind: PortKindEnum.String,
      defaultValue: '',
    }
  })
  outputStream: MultiChannel<string> = new MultiChannel<string>()

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    // Process incoming stream data
    for await (const data of this.inputStream.receive()) {
      // Process data
      const processed = data.toUpperCase()
      // Send to output stream
      this.outputStream.send(processed)
    }

    return {
      status: 'completed',
      startTime: context.startTime,
      endTime: new Date(),
      outputs: new Map(),
    }
  }
}
```

### Streaming Complex Objects

```typescript
@Node({
  type: 'UserStreamProcessor',
  title: 'User Stream Processor',
})
export class UserStreamProcessor extends BaseNode {
  @Input()
  @PortStreamInput({
    valueType: {
      kind: UserProfile, // Using our previously defined UserProfile class
      defaultValue: new UserProfile(),
    }
  })
  userInputStream: MultiChannel<UserProfile> = new MultiChannel<UserProfile>()

  @Output()
  @PortStreamOutput({
    valueType: {
      kind: UserProfile,
      defaultValue: new UserProfile(),
    }
  })
  userOutputStream: MultiChannel<UserProfile> = new MultiChannel<UserProfile>()
}
```

### Streaming Arrays

```typescript
@Node({
  type: 'BatchProcessor',
  title: 'Batch Processor',
})
export class BatchProcessor extends BaseNode {
  @Output()
  @PortStreamOutput({
    valueType: {
      kind: PortKindEnum.Array,
      defaultValue: [],
      elementConfig: {
        kind: PortKindEnum.String,
        defaultValue: '',
      },
    }
  })
  batchStream: MultiChannel<string[]> = new MultiChannel<string[]>()
}
```

## Advanced Port Configurations

### Validation Rules

You can add validation rules to your ports using the `@Validation` decorator:

```typescript
@Node({
  type: 'ValidationExample',
  title: 'Validation Example',
})
export class ValidationExample extends BaseNode {
  @Input()
  @PortString()
  @Validation({
    minLength: 3,
    maxLength: 50,
    pattern: '^[A-Za-z0-9]+$'
  })
  username: string = ''

  @Input()
  @PortNumber()
  @Validation({
    minimum: 0,
    maximum: 100,
    multipleOf: 5
  })
  percentage: number = 0

  @Input()
  @PortArray({
    elementConfig: {
      kind: PortKindEnum.String,
    }
  })
  @Validation({
    minItems: 1,
    maxItems: 10,
    uniqueItems: true
  })
  tags: string[] = []
}
```

### Using Metadata for UI Hints

```typescript
@Node({
  type: 'UIHintsExample',
  title: 'UI Hints Example',
})
export class UIHintsExample extends BaseNode {
  @Input()
  @PortString()
  @Metadata('ui:widget', 'textarea')
  @Metadata('ui:rows', 4)
  @Metadata('ui:placeholder', 'Enter description here...')
  description: string = ''

  @Input()
  @PortNumber()
  @Metadata('ui:widget', 'slider')
  @Metadata('ui:min', 0)
  @Metadata('ui:max', 100)
  @Metadata('ui:step', 5)
  volume: number = 50

  @Input()
  @PortObject({
    schema: UserProfile,
  })
  @Metadata('ui:collapsed', true)
  @Metadata('ui:order', ['name', 'age', 'address', 'emails'])
  user: UserProfile = new UserProfile()
}
```

### Combining Multiple Port Configurations

```typescript
@Node({
  type: 'AdvancedConfig',
  title: 'Advanced Configuration Example',
})
export class AdvancedConfig extends BaseNode {
  @Input()
  @Required()
  @Description('Enter email address')
  @PortString({
    defaultValue: '',
    metadata: {
      'ui:widget': 'email',
      'ui:placeholder': 'user@example.com'
    }
  })
  @Validation({
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  })
  email: string = ''

  @Input()
  @Optional()
  @Name('User Profile')
  @Description('Complete user profile information')
  @PortObject({
    schema: UserProfile,
    defaultValue: new UserProfile({
      name: 'Guest User',
      age: 18
    })
  })
  @Metadata('ui:section', 'userInfo')
  @Metadata('ui:expanded', false)
  profile: UserProfile = new UserProfile()

  @Output()
  @Description('Stream of processed profiles')
  @PortStreamOutput({
    valueType: {
      kind: UserProfile,
    },
    metadata: {
      'ui:buffer-size': 100,
      'ui:show-history': true
    }
  })
  processedProfiles: MultiChannel<UserProfile> = new MultiChannel<UserProfile>()
}
```

# Part 5: Best Practices and Common Patterns

## Node Design Patterns

### 1. Single Responsibility Pattern

Each node should have a clear, single purpose. Here's an example of a well-designed node:

```typescript
@Node({
  type: 'EmailValidator',
  title: 'Email Validator',
  category: 'validation',
  description: 'Validates email addresses and provides detailed feedback',
})
export class EmailValidator extends BaseNode {
  @Input()
  @Required()
  @Description('Email address to validate')
  @PortString({
    metadata: {
      'ui:widget': 'email',
      'ui:placeholder': 'user@example.com'
    }
  })
  email: string = ''

  @Output()
  @Description('Whether the email is valid')
  @PortBoolean()
  isValid: boolean = false

  @Output()
  @Description('Detailed validation messages')
  @PortArray({
    elementConfig: {
      kind: PortKindEnum.String,
    }
  })
  validationMessages: string[] = []
}
```

### 2. Input/Output Organization Pattern

Group related ports together using object ports:

```typescript
@PortObjectSchema({
  description: 'Image processing parameters',
})
class ImageProcessingParams {
  @PortNumber()
  @Description('Brightness adjustment (-100 to 100)')
  brightness: number = 0

  @PortNumber()
  @Description('Contrast adjustment (-100 to 100)')
  contrast: number = 0

  @PortNumber()
  @Description('Saturation adjustment (-100 to 100)')
  saturation: number = 0
}

@Node({
  type: 'ImageProcessor',
  title: 'Image Processor',
  category: 'image',
})
export class ImageProcessor extends BaseNode {
  @Input()
  @Required()
  @PortObject()
  params: ImageProcessingParams = new ImageProcessingParams()

  @Input()
  @Required()
  @Description('Input image data')
  @PortString({
    metadata: {
      'ui:widget': 'image-input'
    }
  })
  inputImage: string = ''

  @Output()
  @Description('Processed image data')
  @PortString({
    metadata: {
      'ui:widget': 'image-preview'
    }
  })
  outputImage: string = ''
}
```

### 3. Configuration Pattern

Use enum ports for configuration options:

```typescript
enum ImageFormat {
  PNG = 'png',
  JPEG = 'jpeg',
  WEBP = 'webp',
}

@Node({
  type: 'ImageConverter',
  title: 'Image Converter',
  category: 'image',
})
export class ImageConverter extends BaseNode {
  @Input()
  @Required()
  @Description('Select output format')
  @PortEnumFromTypeScriptEnum(ImageFormat)
  outputFormat: ImageFormat = ImageFormat.PNG

  @Input()
  @Optional()
  @Description('Quality setting (JPEG/WEBP only)')
  @PortNumber({
    defaultValue: 80,
    metadata: {
      'ui:min': 1,
      'ui:max': 100,
      'ui:step': 1,
      'ui:widget': 'slider'
    }
  })
  quality: number = 80
}
```

### 4. Stream Processing Pattern

Handle data streams efficiently:

```typescript
@Node({
  type: 'DataStreamAggregator',
  title: 'Data Stream Aggregator',
  category: 'streams',
})
export class DataStreamAggregator extends BaseNode {
  @Input()
  @Required()
  @Description('Window size for aggregation')
  @PortNumber({
    defaultValue: 10,
    metadata: {
      'ui:min': 1,
      'ui:max': 100
    }
  })
  windowSize: number = 10

  @Input()
  @PortStreamInput({
    valueType: {
      kind: PortKindEnum.Number
    }
  })
  inputStream: MultiChannel<number> = new MultiChannel<number>()

  @Output()
  @PortStreamOutput({
    valueType: {
      kind: PortKindEnum.Array,
      elementConfig: {
        kind: PortKindEnum.Number
      }
    }
  })
  aggregatedStream: MultiChannel<number[]> = new MultiChannel<number[]>()

  private buffer: number[] = []

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    for await (const value of this.inputStream.receive()) {
      this.buffer.push(value)

      if (this.buffer.length >= this.windowSize) {
        this.aggregatedStream.send([...this.buffer])
        this.buffer = []
      }
    }

    return {
      status: 'completed',
      startTime: context.startTime,
      endTime: new Date(),
      outputs: new Map(),
    }
  }
}
```

## Common Use Cases

### 1. Data Transformation Node

```typescript
@PortObjectSchema()
class TransformationRules {
  @PortBoolean()
  @Description('Convert to uppercase')
  toUpperCase: boolean = false

  @PortBoolean()
  @Description('Trim whitespace')
  trim: boolean = true

  @PortString()
  @Description('Prefix to add')
  prefix: string = ''

  @PortString()
  @Description('Suffix to add')
  suffix: string = ''
}

@Node({
  type: 'TextTransformer',
  title: 'Text Transformer',
  category: 'text',
})
export class TextTransformer extends BaseNode {
  @Input()
  @Required()
  @PortString()
  input: string = ''

  @Input()
  @PortObject()
  rules: TransformationRules = new TransformationRules()

  @Output()
  @PortString()
  output: string = ''
}
```

### 2. Data Validation Node

```typescript
@PortObjectSchema()
class ValidationResult {
  @PortBoolean()
  isValid: boolean = false

  @PortArray({
    elementConfig: {
      kind: PortKindEnum.String
    }
  })
  errors: string[] = []

  @PortObject({
    defaultValue: {}
  })
  details: Record<string, any> = {}
}

@Node({
  type: 'DataValidator',
  title: 'Data Validator',
  category: 'validation',
})
export class DataValidator extends BaseNode {
  @Input()
  @Required()
  @PortObject()
  data: any

  @Input()
  @Required()
  @PortString({
    metadata: {
      'ui:widget': 'code-editor',
      'ui:language': 'json'
    }
  })
  schema: string = ''

  @Output()
  @PortObject()
  validationResult: ValidationResult = new ValidationResult()
}
```

# Part 6: Troubleshooting and Common Issues

## Common Issues and Solutions

### 1. Schema Inference Issues

#### Problem: Schema Not Being Detected

```typescript
// ❌ Incorrect: Schema won't be properly inferred
@Node({
  type: 'UserNode',
})
export class UserNode extends BaseNode {
  @Input()
  @PortObject()
  user: UserProfile // Missing initialization or schema
}
```

#### Solution: Provide Proper Schema Information

```typescript
// ✅ Correct: Multiple ways to provide schema information
@Node({
  type: 'UserNode',
})
export class UserNode extends BaseNode {
  // Solution 1: Initialize with default value
  @Input()
  @PortObject()
  user1: UserProfile = new UserProfile()

  // Solution 2: Explicitly specify schema
  @Input()
  @PortObject({
    schema: UserProfile
  })
  user2?: UserProfile

  // Solution 3: Use kind property
  @Input()
  @Port({
    kind: UserProfile
  })
  user3?: UserProfile
}
```

### 2. Array Port Configuration Issues

#### Problem: Incorrect Array Configuration

```typescript
// ❌ Incorrect: Missing element configuration
@Input()
@PortArray()
items: string[] = []
```

#### Solution: Proper Array Configuration

```typescript
// ✅ Correct: Multiple ways to configure arrays
@Node({
  type: 'ArrayNode',
})
export class ArrayNode extends BaseNode {
  // Solution 1: Using PortStringArray helper
  @Input()
  @PortStringArray()
  strings?: string[]

  // Solution 2: Explicit configuration
  @Input()
  @PortArray({
    elementConfig: {
      kind: PortKindEnum.String,
      defaultValue: ''
    }
  })
  explicitStrings: string[] = []

  // Solution 3: For object arrays
  @Input()
  @PortArrayObject(UserProfile)
  users?: UserProfile[]

  // Solution 4: For nested arrays
  @Input()
  @PortArrayNested(2, {
    kind: PortKindEnum.Number,
    defaultValue: 0
  })
  matrix?: number[][]
}
```

### 3. Enum Port Issues

#### Problem: Invalid Enum Configuration

```typescript
// ❌ Incorrect: Default value doesn't match any option ID
@Input()
@PortEnum({
  options: [
    { kind: PortKindEnum.String, id: 'red', defaultValue: 'Red' },
    { kind: PortKindEnum.String, id: 'green', defaultValue: 'Green' }
  ],
  defaultValue: 'Red'  // Wrong! Should be 'red' (option ID)
})
color: string = 'Red'
```

#### Solution: Correct Enum Configuration

```typescript
// ✅ Correct: Properly configured enum ports
@Node({
  type: 'EnumNode',
})
export class EnumNode extends BaseNode {
  // Solution 1: Simple string enum
  @Input()
  @PortStringEnum(['Red', 'Green', 'Blue'])
  color: string = 'Red'

  // Solution 2: Complex enum with objects
  @Input()
  @PortEnum({
    options: [
      {
        kind: UserProfile,
        id: 'admin',
        defaultValue: new UserProfile({ name: 'Admin' })
      },
      {
        kind: UserProfile,
        id: 'user',
        defaultValue: new UserProfile({ name: 'User' })
      }
    ],
    defaultValue: 'admin' // Correct: Using option ID
  })
  userType: string = 'admin'
}
```

### 4. Stream Port Issues

#### Problem: Incorrect Stream Handling

```typescript
// ❌ Incorrect: Not properly handling stream lifecycle
@Node({
  type: 'StreamNode',
})
export class StreamNode extends BaseNode {
  @Input()
  @PortStreamInput({
    valueType: {
      kind: PortKindEnum.String
    }
  })
  inputStream: MultiChannel<string> = new MultiChannel<string>()

  async execute(): Promise<NodeExecutionResult> {
    // Wrong: Not closing the stream
    for await (const data of this.inputStream.receive()) {
      // Process data
    }
    return { /* ... */ }
  }
}
```

#### Solution: Proper Stream Handling

```typescript
// ✅ Correct: Proper stream handling
@Node({
  type: 'StreamNode',
})
export class StreamNode extends BaseNode {
  @Input()
  @PortStreamInput({
    valueType: {
      kind: PortKindEnum.String
    }
  })
  inputStream: MultiChannel<string> = new MultiChannel<string>()

  @Output()
  @PortStreamOutput({
    valueType: {
      kind: PortKindEnum.String
    }
  })
  outputStream: MultiChannel<string> = new MultiChannel<string>()

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      for await (const data of this.inputStream.receive()) {
        // Process data
        this.outputStream.send(data.toUpperCase())
      }
    } catch (error) {
      // Handle errors
    } finally {
      // Clean up
      this.outputStream.close()
    }

    return {
      status: 'completed',
      startTime: context.startTime,
      endTime: new Date(),
      outputs: new Map(),
    }
  }
}
```

### 5. Validation Issues

#### Problem: Missing Validation

```typescript
// ❌ Incorrect: No validation for required fields
@Input()
@PortString()
username: string = ''
```

#### Solution: Proper Validation

```typescript
// ✅ Correct: Comprehensive validation
@Node({
  type: 'ValidationNode',
})
export class ValidationNode extends BaseNode {
  @Input()
  @Required()
  @PortString({
    validation: {
      minLength: 3,
      maxLength: 20,
      pattern: '^[a-zA-Z0-9_]+$'
    }
  })
  @Description('Username (3-20 characters, alphanumeric and underscore only)')
  username: string = ''

  async validate(): Promise<boolean> {
    if (!this.username) {
      throw new Error('Username is required')
    }
    return true
  }
}
```

# Part 7: Advanced Techniques and Optimization

## Advanced Node Patterns

### 1. Composite Node Pattern

This pattern allows you to create nodes that manage complex hierarchical data structures:

```typescript
@PortObjectSchema({
  description: 'Tree node structure'
})
class TreeNode {
  @PortString()
  @Description('Node identifier')
  id: string = ''

  @PortString()
  @Description('Node label')
  label: string = ''

  @PortArray({
    elementConfig: {
      kind: TreeNode
    }
  })
  @Description('Child nodes')
  children: TreeNode[] = []
}

@Node({
  type: 'TreeProcessor',
  title: 'Tree Processor',
  category: 'data-structures',
  description: 'Processes hierarchical tree structures',
})
export class TreeProcessor extends BaseNode {
  @Input()
  @PortObject({
    schema: TreeNode,
  })
  @Description('Input tree structure')
  inputTree: TreeNode = new TreeNode()

  @Output()
  @PortStreamOutput({
    valueType: {
      kind: TreeNode
    }
  })
  @Description('Stream of processed nodes (depth-first)')
  nodeStream: MultiChannel<TreeNode> = new MultiChannel<TreeNode>()

  private async processNode(node: TreeNode): Promise<void> {
    // Process current node
    this.nodeStream.send(node)

    // Process children recursively
    for (const child of node.children) {
      await this.processNode(child)
    }
  }
}
```

### 2. State Management Pattern

Managing internal node state with proper cleanup:

```typescript
@PortObjectSchema()
class ProcessingState {
  @PortNumber()
  processedItems: number = 0

  @PortNumber()
  errorCount: number = 0

  @PortArray({
    elementConfig: {
      kind: PortKindEnum.String
    }
  })
  errors: string[] = []
}

@Node({
  type: 'StatefulProcessor',
  title: 'Stateful Processor',
  category: 'processing',
})
export class StatefulProcessor extends BaseNode {
  @Input()
  @PortStreamInput({
    valueType: {
      kind: PortKindEnum.String
    }
  })
  inputStream: MultiChannel<string> = new MultiChannel<string>()

  @Output()
  @PortObject()
  state: ProcessingState = new ProcessingState()

  private cleanup?: () => void
  private processingInterval?: NodeJS.Timeout

  async initialize(): Promise<void> {
    await super.initialize()

    // Setup state monitoring
    this.processingInterval = setInterval(() => {
      // Update state periodically
      this.state.processedItems += 1
    }, 1000)

    // Setup cleanup
    this.cleanup = () => {
      if (this.processingInterval) {
        clearInterval(this.processingInterval)
      }
      // Reset state
      this.state = new ProcessingState()
    }
  }

  async dispose(): Promise<void> {
    if (this.cleanup) {
      this.cleanup()
    }
    await super.dispose()
  }
}
```

### 3. Cache Management Pattern

Implementing efficient caching for expensive operations:

```typescript
@PortObjectSchema()
class CacheStats {
  @PortNumber()
  hits: number = 0

  @PortNumber()
  misses: number = 0

  @PortNumber()
  size: number = 0
}

@Node({
  type: 'CachedProcessor',
  title: 'Cached Processor',
  category: 'optimization',
})
export class CachedProcessor extends BaseNode {
  @Input()
  @PortNumber()
  @Description('Maximum cache size')
  maxCacheSize: number = 1000

  @Input()
  @PortNumber()
  @Description('Cache TTL in milliseconds')
  cacheTTL: number = 60000 // 1 minute

  @Output()
  @PortObject()
  cacheStats: CacheStats = new CacheStats()

  private cache: Map<string, { value: any, timestamp: number }> = new Map()

  private async getFromCache<T>(key: string): Promise<T | undefined> {
    const entry = this.cache.get(key)
    if (!entry) {
      this.cacheStats.misses++
      return undefined
    }

    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key)
      this.cacheStats.misses++
      return undefined
    }

    this.cacheStats.hits++
    return entry.value as T
  }

  private setCache(key: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    })

    this.cacheStats.size = this.cache.size
  }

  async reset(): Promise<void> {
    this.cache.clear()
    this.cacheStats = new CacheStats()
    await super.reset()
  }
}
```

### 4. Batch Processing Pattern

Efficient handling of batch operations:

```typescript
@PortObjectSchema()
class BatchConfig {
  @PortNumber()
  @Description('Batch size')
  size: number = 100

  @PortNumber()
  @Description('Batch timeout in milliseconds')
  timeout: number = 5000

  @PortBoolean()
  @Description('Process partial batches')
  processPartial: boolean = true
}

@Node({
  type: 'BatchProcessor',
  title: 'Batch Processor',
  category: 'processing',
})
export class BatchProcessor extends BaseNode {
  @Input()
  @PortObject()
  config: BatchConfig = new BatchConfig()

  @Input()
  @PortStreamInput({
    valueType: {
      kind: PortKindEnum.Any
    }
  })
  inputStream: MultiChannel<any> = new MultiChannel<any>()

  @Output()
  @PortStreamOutput({
    valueType: {
      kind: PortKindEnum.Array,
      elementConfig: {
        kind: PortKindEnum.Any
      }
    }
  })
  batchStream: MultiChannel<any[]> = new MultiChannel<any[]>()

  private batch: any[] = []
  private batchTimeout?: NodeJS.Timeout

  private processBatch = () => {
    if (this.batch.length > 0) {
      this.batchStream.send([...this.batch])
      this.batch = []
    }
  }

  private setupBatchTimeout() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }
    this.batchTimeout = setTimeout(() => {
      if (this.config.processPartial) {
        this.processBatch()
      }
    }, this.config.timeout)
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      for await (const item of this.inputStream.receive()) {
        this.batch.push(item)

        if (this.batch.length >= this.config.size) {
          this.processBatch()
        }

        this.setupBatchTimeout()
      }

      // Process remaining items
      if (this.config.processPartial) {
        this.processBatch()
      }
    } finally {
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout)
      }
      this.batchStream.close()
    }

    return {
      status: 'completed',
      startTime: context.startTime,
      endTime: new Date(),
      outputs: new Map(),
    }
  }
}
```
