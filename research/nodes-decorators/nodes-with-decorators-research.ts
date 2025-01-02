import 'reflect-metadata'

// Core types
type Direction = 'in' | 'out'
type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'stream'

// Port metadata
interface PortMetadata {
    name: string
    type: DataType
    direction?: Direction // Optional for fields
    title?: string
    description?: string
    default?: unknown
    optional?: boolean
    config?: any
    fields?: PortMetadata[] // Nested fields
}

// Node metadata
interface NodeMetadata {
    type: string
    category: string
    title?: string
    description?: string
    ports: Map<string, PortMetadata>
}

// Metadata key symbols
const NODE_METADATA_KEY = Symbol('node:metadata')
const FIELD_PORT_METADATA_KEY = Symbol('fieldPort:metadata')

// Helper function to get or create node metadata
function getOrCreateNodeMetadata(target: any): NodeMetadata {
    if (!Reflect.hasMetadata(NODE_METADATA_KEY, target)) {
        Reflect.defineMetadata(
            NODE_METADATA_KEY,
            {
                type: '',
                category: '',
                ports: new Map<string, PortMetadata>(),
            },
            target
        )
    }
    return Reflect.getMetadata(NODE_METADATA_KEY, target)
}

// Node and Port decorators
function FlowNode(config: Omit<NodeMetadata, 'ports'>) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (constructor: Function) {
        const metadata = getOrCreateNodeMetadata(constructor.prototype)
        Object.assign(metadata, config)
    }
}

function Port(config: Omit<PortMetadata, 'name'>) {
    return function (target: any, propertyKey: string) {
        const metadata = getOrCreateNodeMetadata(target)
        metadata.ports.set(propertyKey, {
            name: propertyKey,
            ...config,
        })
    }
}

// FieldPort decorator for object fields
function FieldPort(config: Omit<PortMetadata, 'name'> & { type: DataType }) {
    return function (target: any, propertyKey: string) {
        let fields: Map<string, PortMetadata>
        if (!Reflect.hasMetadata(FIELD_PORT_METADATA_KEY, target)) {
            fields = new Map()
            Reflect.defineMetadata(FIELD_PORT_METADATA_KEY, fields, target)
        } else {
            fields = Reflect.getMetadata(FIELD_PORT_METADATA_KEY, target)
        }
        fields.set(propertyKey, {
            name: propertyKey,
            ...config,
        })
    }
}

// Schema Generator
class SchemaGenerator {
    static generateSchema(nodeInstance: any): any {
        const nodeMetadata: NodeMetadata = Reflect.getMetadata(
            NODE_METADATA_KEY,
            nodeInstance
        )

        const ports: any = {
            inputs: [],
            outputs: [],
        }

        nodeMetadata.ports.forEach((portMeta, propertyKey) => {
            const portSchema = this.processPort(portMeta, nodeInstance[propertyKey])
            if (portMeta.direction === 'in') {
                ports.inputs.push(portSchema)
            } else {
                ports.outputs.push(portSchema)
            }
        })

        return {
            id: `node_${Date.now()}`,
            type: nodeMetadata.type,
            category: nodeMetadata.category,
            title: nodeMetadata.title,
            description: nodeMetadata.description,
            ports,
        }
    }

    static processPort(portMeta: PortMetadata, portValue: any): any {
        const schema: any = {
            name: portMeta.name,
            direction: portMeta.direction,
            title: portMeta.title,
            type: portMeta.type,
        }

        if (
            portMeta.type === 'object' &&
            portValue &&
            typeof portValue === 'object'
        ) {
            schema.fields = this.processFields(
                portValue,
                portMeta.direction,
                portMeta.fields || []
            )
        }

        return schema
    }

    static processFields(
        instance: any,
        parentDirection: Direction | undefined,
        fieldMetadatas: PortMetadata[]
    ): any[] {
        const fields: any[] = []
        const fieldPorts: Map<string, PortMetadata> =
            Reflect.getMetadata(FIELD_PORT_METADATA_KEY, instance) || new Map()

        fieldPorts.forEach((fieldMeta, propertyKey) => {
            const fieldValue = instance[propertyKey]
            // Use field's own direction if specified, otherwise inherit from parent
            const direction = fieldMeta.direction || parentDirection
            const fieldSchema: any = {
                name: fieldMeta.name,
                type: fieldMeta.type,
                direction: direction,
                title: fieldMeta.title,
            }

            if (
                fieldMeta.type === 'object' &&
                fieldValue &&
                typeof fieldValue === 'object'
            ) {
                fieldSchema.fields = this.processFields(
                    fieldValue,
                    direction,
                    fieldMeta.fields || []
                )
            }

            fields.push(fieldSchema)
        })

        return fields
    }

    static generateNodeData(nodeInstance: any): any {
        const nodeMetadata: NodeMetadata = Reflect.getMetadata(
            NODE_METADATA_KEY,
            nodeInstance
        )

        const values: any = {}
        nodeMetadata.ports.forEach((portMeta, propertyKey) => {
            const portValue = nodeInstance[propertyKey]
            values[propertyKey] = this.extractValues(portValue)
        })

        return {
            id: `node_${Date.now()}`,
            values,
        }
    }

    static extractValues(instance: any): any {
        if (typeof instance !== 'object' || instance === null) {
            return instance
        }

        const result: any = {}
        const fieldPorts: Map<string, PortMetadata> =
            Reflect.getMetadata(FIELD_PORT_METADATA_KEY, instance) || new Map()

        fieldPorts.forEach((fieldMeta, propertyKey) => {
            const fieldValue = instance[propertyKey]
            result[propertyKey] = this.extractValues(fieldValue)
        })

        return result
    }

    static serializeNode(nodeInstance: any): string {
        const schema = this.generateSchema(nodeInstance)
        const data = this.generateNodeData(nodeInstance)

        return JSON.stringify({ schema, data }, null, 2)
    }
}

// Data Classes with Decorated Fields
class Address {
    @FieldPort({ type: 'string', title: 'Street' })
    street = ''

    @FieldPort({ type: 'string', title: 'City' })
    city = ''

    @FieldPort({ type: 'string', title: 'Zip Code' })
    zipCode = ''

    @FieldPort({ type: 'object', title: 'Nested Address' })
    nestedAddress?: Address
}

class UserProfile {
    @FieldPort({ type: 'string', title: 'Name' })
    name = ''

    @FieldPort({ type: 'number', title: 'Age' })
    age = 0

    @FieldPort({ type: 'string', title: 'Email' })
    email = ''

    @FieldPort({ type: 'object', title: 'Address' })
    address: Address = new Address()
}

// Node Class
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
        const postfix = ' (executed)'
        this.processedProfile.name = this.userProfile.name + postfix
        if (this.userProfile.email)
            this.processedProfile.email = this.userProfile.email + postfix
        if (this.userProfile.address) {
            this.processedProfile.address.street =
                this.userProfile.address.street + postfix
            this.processedProfile.address.city =
                this.userProfile.address.city + postfix
            this.processedProfile.address.zipCode =
                this.userProfile.address.zipCode + postfix

            if (this.userProfile.address.nestedAddress !== undefined) {
                if (this.processedProfile.address.nestedAddress === undefined) {
                    this.processedProfile.address.nestedAddress = new Address()
                }

                this.processedProfile.address.nestedAddress.street =
                    this.userProfile.address.nestedAddress.street + postfix
                this.processedProfile.address.nestedAddress.city =
                    this.userProfile.address.nestedAddress.city + postfix
                this.processedProfile.address.nestedAddress.zipCode =
                    this.userProfile.address.nestedAddress.zipCode + postfix
            }
        }
        this.processedProfile.age = this.userProfile.age
    }
}

// Instantiate the node and set some values
const userNode = new UserProfileNode()
userNode.userProfile.name = 'Alice'
userNode.userProfile.age = 30
userNode.userProfile.email = 'alice@example.com'
userNode.userProfile.address.street = '123 Main St'
userNode.userProfile.address.city = 'Wonderland'
userNode.userProfile.address.zipCode = '12345'
userNode.userProfile.address.nestedAddress = new Address()
userNode.userProfile.address.nestedAddress.street = '456 Sub St'
userNode.userProfile.address.nestedAddress.city = 'Underland'
userNode.userProfile.address.nestedAddress.zipCode = '54321'

userNode.execute()

// Serialize and print
console.log('Serialized Node:')
console.log(SchemaGenerator.serializeNode(userNode))

// schema only:
console.log('Schema:')
console.log(JSON.stringify(SchemaGenerator.generateSchema(userNode), null, 2))

// data only:
console.log('Data:')
console.log(JSON.stringify(SchemaGenerator.generateNodeData(userNode), null, 2))

/*
Execution result:

Serialized Node:
{
  "schema": {
    "id": "node_1735671004939",
    "type": "UserProfileNode",
    "category": "Data Processing",
    "title": "User Profile Node",
    "ports": {
      "inputs": [
        {
          "name": "userProfile",
          "direction": "in",
          "title": "User Profile Input",
          "type": "object",
          "fields": [
            {
              "name": "name",
              "type": "string",
              "direction": "in",
              "title": "Name"
            },
            {
              "name": "age",
              "type": "number",
              "direction": "in",
              "title": "Age"
            },
            {
              "name": "email",
              "type": "string",
              "direction": "in",
              "title": "Email"
            },
            {
              "name": "address",
              "type": "object",
              "direction": "in",
              "title": "Address",
              "fields": [
                {
                  "name": "street",
                  "type": "string",
                  "direction": "in",
                  "title": "Street"
                },
                {
                  "name": "city",
                  "type": "string",
                  "direction": "in",
                  "title": "City"
                },
                {
                  "name": "zipCode",
                  "type": "string",
                  "direction": "in",
                  "title": "Zip Code"
                },
                {
                  "name": "nestedAddress",
                  "type": "object",
                  "direction": "in",
                  "title": "Nested Address",
                  "fields": [
                    {
                      "name": "street",
                      "type": "string",
                      "direction": "in",
                      "title": "Street"
                    },
                    {
                      "name": "city",
                      "type": "string",
                      "direction": "in",
                      "title": "City"
                    },
                    {
                      "name": "zipCode",
                      "type": "string",
                      "direction": "in",
                      "title": "Zip Code"
                    },
                    {
                      "name": "nestedAddress",
                      "type": "object",
                      "direction": "in",
                      "title": "Nested Address"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "processedProfile",
          "direction": "out",
          "title": "Processed User Profile",
          "type": "object",
          "fields": [
            {
              "name": "name",
              "type": "string",
              "direction": "out",
              "title": "Name"
            },
            {
              "name": "age",
              "type": "number",
              "direction": "out",
              "title": "Age"
            },
            {
              "name": "email",
              "type": "string",
              "direction": "out",
              "title": "Email"
            },
            {
              "name": "address",
              "type": "object",
              "direction": "out",
              "title": "Address",
              "fields": [
                {
                  "name": "street",
                  "type": "string",
                  "direction": "out",
                  "title": "Street"
                },
                {
                  "name": "city",
                  "type": "string",
                  "direction": "out",
                  "title": "City"
                },
                {
                  "name": "zipCode",
                  "type": "string",
                  "direction": "out",
                  "title": "Zip Code"
                },
                {
                  "name": "nestedAddress",
                  "type": "object",
                  "direction": "out",
                  "title": "Nested Address",
                  "fields": [
                    {
                      "name": "street",
                      "type": "string",
                      "direction": "out",
                      "title": "Street"
                    },
                    {
                      "name": "city",
                      "type": "string",
                      "direction": "out",
                      "title": "City"
                    },
                    {
                      "name": "zipCode",
                      "type": "string",
                      "direction": "out",
                      "title": "Zip Code"
                    },
                    {
                      "name": "nestedAddress",
                      "type": "object",
                      "direction": "out",
                      "title": "Nested Address"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  "data": {
    "id": "node_1735671004939",
    "values": {
      "userProfile": {
        "name": "Alice",
        "age": 30,
        "email": "alice@example.com",
        "address": {
          "street": "123 Main St",
          "city": "Wonderland",
          "zipCode": "12345",
          "nestedAddress": {
            "street": "456 Sub St",
            "city": "Underland",
            "zipCode": "54321"
          }
        }
      },
      "processedProfile": {
        "name": "Alice (executed)",
        "age": 30,
        "email": "alice@example.com (executed)",
        "address": {
          "street": "123 Main St (executed)",
          "city": "Wonderland (executed)",
          "zipCode": "12345 (executed)",
          "nestedAddress": {
            "street": "456 Sub St (executed)",
            "city": "Underland (executed)",
            "zipCode": "54321 (executed)"
          }
        }
      }
    }
  }
}
Schema:
{
  "id": "node_1735671004940",
  "type": "UserProfileNode",
  "category": "Data Processing",
  "title": "User Profile Node",
  "ports": {
    "inputs": [
      {
        "name": "userProfile",
        "direction": "in",
        "title": "User Profile Input",
        "type": "object",
        "fields": [
          {
            "name": "name",
            "type": "string",
            "direction": "in",
            "title": "Name"
          },
          {
            "name": "age",
            "type": "number",
            "direction": "in",
            "title": "Age"
          },
          {
            "name": "email",
            "type": "string",
            "direction": "in",
            "title": "Email"
          },
          {
            "name": "address",
            "type": "object",
            "direction": "in",
            "title": "Address",
            "fields": [
              {
                "name": "street",
                "type": "string",
                "direction": "in",
                "title": "Street"
              },
              {
                "name": "city",
                "type": "string",
                "direction": "in",
                "title": "City"
              },
              {
                "name": "zipCode",
                "type": "string",
                "direction": "in",
                "title": "Zip Code"
              },
              {
                "name": "nestedAddress",
                "type": "object",
                "direction": "in",
                "title": "Nested Address",
                "fields": [
                  {
                    "name": "street",
                    "type": "string",
                    "direction": "in",
                    "title": "Street"
                  },
                  {
                    "name": "city",
                    "type": "string",
                    "direction": "in",
                    "title": "City"
                  },
                  {
                    "name": "zipCode",
                    "type": "string",
                    "direction": "in",
                    "title": "Zip Code"
                  },
                  {
                    "name": "nestedAddress",
                    "type": "object",
                    "direction": "in",
                    "title": "Nested Address"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "outputs": [
      {
        "name": "processedProfile",
        "direction": "out",
        "title": "Processed User Profile",
        "type": "object",
        "fields": [
          {
            "name": "name",
            "type": "string",
            "direction": "out",
            "title": "Name"
          },
          {
            "name": "age",
            "type": "number",
            "direction": "out",
            "title": "Age"
          },
          {
            "name": "email",
            "type": "string",
            "direction": "out",
            "title": "Email"
          },
          {
            "name": "address",
            "type": "object",
            "direction": "out",
            "title": "Address",
            "fields": [
              {
                "name": "street",
                "type": "string",
                "direction": "out",
                "title": "Street"
              },
              {
                "name": "city",
                "type": "string",
                "direction": "out",
                "title": "City"
              },
              {
                "name": "zipCode",
                "type": "string",
                "direction": "out",
                "title": "Zip Code"
              },
              {
                "name": "nestedAddress",
                "type": "object",
                "direction": "out",
                "title": "Nested Address",
                "fields": [
                  {
                    "name": "street",
                    "type": "string",
                    "direction": "out",
                    "title": "Street"
                  },
                  {
                    "name": "city",
                    "type": "string",
                    "direction": "out",
                    "title": "City"
                  },
                  {
                    "name": "zipCode",
                    "type": "string",
                    "direction": "out",
                    "title": "Zip Code"
                  },
                  {
                    "name": "nestedAddress",
                    "type": "object",
                    "direction": "out",
                    "title": "Nested Address"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
Data:
{
  "id": "node_1735671004941",
  "values": {
    "userProfile": {
      "name": "Alice",
      "age": 30,
      "email": "alice@example.com",
      "address": {
        "street": "123 Main St",
        "city": "Wonderland",
        "zipCode": "12345",
        "nestedAddress": {
          "street": "456 Sub St",
          "city": "Underland",
          "zipCode": "54321"
        }
      }
    },
    "processedProfile": {
      "name": "Alice (executed)",
      "age": 30,
      "email": "alice@example.com (executed)",
      "address": {
        "street": "123 Main St (executed)",
        "city": "Wonderland (executed)",
        "zipCode": "12345 (executed)",
        "nestedAddress": {
          "street": "456 Sub St (executed)",
          "city": "Underland (executed)",
          "zipCode": "54321 (executed)"
        }
      }
    }
  }
}

 */
