"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Database, RefreshCw, Table, FileText, Search } from "lucide-react"
import EndPointService from "@/app/api/services/endpoint-service"

type DatabaseFile = {
  name: string
  path: string
  size: number
  type: string
}

type TableInfo = {
  name: string
  rowCount: number
  columns: {
    name: string
    type: string
    nullable: boolean
    primaryKey: boolean
  }[]
}

type TableRow = Record<string, any>

export function DatabaseViewer({ projectId, theme }: { projectId: string; theme?: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbFiles, setDbFiles] = useState<DatabaseFile[]>([])
  const [selectedDbFile, setSelectedDbFile] = useState<string | null>(null)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableRows, setTableRows] = useState<TableRow[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [viewMode, setViewMode] = useState<"tables" | "full">("tables")

  const endpointService = new EndPointService()

  // Fetch database files when component mounts or projectId changes
  useEffect(() => {
    if (!projectId) {
      setIsLoading(false)
      return
    }

    const fetchDatabaseFiles = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const files = await endpointService.getDatabaseFiles(projectId)
        setDbFiles(files)

        // Auto-select the first database file if available
        if (files.length > 0 && !selectedDbFile) {
          setSelectedDbFile(files[0].name)
        }
      } catch (err) {
        console.error("Error fetching database files:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch database files")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDatabaseFiles()
  }, [projectId, refreshKey])

  // Fetch tables when a database file is selected
  useEffect(() => {
    if (!projectId || !selectedDbFile) return

    const fetchTables = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const tables = await endpointService.getDatabaseTables(projectId, selectedDbFile)
        setTables(tables)

        // Auto-select the first table if available
        if (tables.length > 0 && !selectedTable) {
          setSelectedTable(tables[0].name)
        }
      } catch (err) {
        console.error("Error fetching tables:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch database tables")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTables()
  }, [projectId, selectedDbFile, refreshKey])

  // Fetch table rows when a table is selected
  useEffect(() => {
    if (!projectId || !selectedDbFile || !selectedTable) return

    const fetchTableRows = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const rows = await endpointService.getTableRows(projectId, selectedDbFile, selectedTable)
        setTableRows(rows)
      } catch (err) {
        console.error("Error fetching table rows:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch table rows")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTableRows()
  }, [projectId, selectedDbFile, selectedTable, refreshKey])

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Filter tables based on search term
  const filteredTables = tables.filter((table) => table.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Get column names from the first row
  const getColumnNames = () => {
    if (tableRows.length === 0) return []
    return Object.keys(tableRows[0])
  }

  // Get column type for display
  const getColumnType = (columnName: string) => {
    const table = tables.find((t) => t.name === selectedTable)
    if (!table) return "unknown"

    const column = table.columns.find((c) => c.name === columnName)
    return column?.type || "unknown"
  }

  // Get column badge class based on type
  const getColumnBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case "integer":
      case "int":
      case "bigint":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "text":
      case "varchar":
      case "char":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "boolean":
      case "bool":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "date":
      case "datetime":
      case "timestamp":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "float":
      case "double":
      case "decimal":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Format cell value based on type
  const formatCellValue = (value: any, columnName: string) => {
    if (value === null || value === undefined) return <span className="text-zinc-400">NULL</span>

    const type = getColumnType(columnName).toLowerCase()

    if (typeof value === "object") {
      return <span className="font-mono text-xs">{JSON.stringify(value)}</span>
    }

    if (type.includes("bool")) {
      return value ? (
        <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
          true
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-100 dark:bg-red-900">
          false
        </Badge>
      )
    }

    if (type.includes("date") || type.includes("time")) {
      try {
        const date = new Date(value)
        return date.toLocaleString()
      } catch (e) {
        return value
      }
    }

    return value
  }

  // Render loading state
  if (isLoading && !dbFiles.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#7dff00]" />
          <p className="text-zinc-500 dark:text-zinc-400">Loading database information...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (error && !dbFiles.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md border-red-300 dark:border-red-800">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="text-red-700 dark:text-red-300">Error</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <Button variant="outline" className="mt-4" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render empty state
  if (!dbFiles.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              No Database Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-500 dark:text-zinc-400">
              No database files were found for this project. Create a database file to get started.
            </p>
            <Button variant="outline" className="mt-4" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center space-x-4">
          <Select value={selectedDbFile || ""} onValueChange={setSelectedDbFile}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select database" />
            </SelectTrigger>
            <SelectContent>
              {dbFiles.map((file) => (
                <SelectItem key={file.name} value={file.name}>
                  {file.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <TabsList>
              <TabsTrigger
                value="tables"
                onClick={() => setViewMode("tables")}
                className={viewMode === "tables" ? "bg-[#7dff00] text-black" : ""}
              >
                <Table className="h-4 w-4 mr-2" />
                Tables
              </TabsTrigger>
              <TabsTrigger
                value="full"
                onClick={() => setViewMode("full")}
                className={viewMode === "full" ? "bg-[#7dff00] text-black" : ""}
              >
                <FileText className="h-4 w-4 mr-2" />
                Full View
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-zinc-500" />
            <Input
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {viewMode === "tables" ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Table list sidebar */}
            <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Tables</h3>
                <div className="space-y-1">
                  {filteredTables.map((table) => (
                    <Button
                      key={table.name}
                      variant="ghost"
                      className={`w-full justify-start text-left ${
                        selectedTable === table.name ? "bg-zinc-100 dark:bg-zinc-800 font-medium" : ""
                      }`}
                      onClick={() => setSelectedTable(table.name)}
                    >
                      <Table className="h-4 w-4 mr-2" />
                      <span className="truncate">{table.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {table.rowCount}
                      </Badge>
                    </Button>
                  ))}

                  {filteredTables.length === 0 && (
                    <div className="text-center py-4 text-zinc-500 dark:text-zinc-400">No tables found</div>
                  )}
                </div>
              </div>
            </div>

            {/* Table content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {selectedTable ? (
                <>
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-medium flex items-center">
                      <Table className="h-5 w-5 mr-2" />
                      {selectedTable}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {tables.find((t) => t.name === selectedTable)?.rowCount || 0} rows
                    </p>
                  </div>

                  <div className="flex-1 overflow-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-[#7dff00]" />
                      </div>
                    ) : tableRows.length > 0 ? (
                      <div className="p-4">
                        <div className="border rounded-md overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                  {getColumnNames().map((column) => (
                                    <th
                                      key={column}
                                      className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <span>{column}</span>
                                        <Badge className={`${getColumnBadgeClass(getColumnType(column))} text-[10px]`}>
                                          {getColumnType(column)}
                                        </Badge>
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {tableRows.map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className="border-b border-zinc-200 dark:border-zinc-700 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                  >
                                    {getColumnNames().map((column) => (
                                      <td key={`${rowIndex}-${column}`} className="px-4 py-2 text-sm">
                                        {formatCellValue(row[column], column)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
                        No rows found in this table
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
                  Select a table to view its data
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={tables.map((t) => t.name)}>
                  {tables.map((table) => (
                    <AccordionItem key={table.name} value={table.name}>
                      <AccordionTrigger className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-4">
                        <div className="flex items-center">
                          <Table className="h-4 w-4 mr-2" />
                          <span>{table.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {table.rowCount} rows
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-6 pr-4 pb-2">
                          <div className="border rounded-md overflow-hidden">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    Column
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    Type
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    Nullable
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    Primary Key
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {table.columns.map((column) => (
                                  <tr
                                    key={column.name}
                                    className="border-b border-zinc-200 dark:border-zinc-700 last:border-0"
                                  >
                                    <td className="px-4 py-2 text-sm font-medium">{column.name}</td>
                                    <td className="px-4 py-2 text-sm">
                                      <Badge className={getColumnBadgeClass(column.type)}>{column.type}</Badge>
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {column.nullable ? (
                                        <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800">
                                          YES
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/20">
                                          NO
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {column.primaryKey ? (
                                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                          PK
                                        </Badge>
                                      ) : (
                                        <span className="text-zinc-400">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => {
                              setSelectedTable(table.name)
                              setViewMode("tables")
                            }}
                          >
                            View Data
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
