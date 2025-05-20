"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  rows?: Record<string, any>[]
}

type TableRow = Record<string, any>

type DatabaseViewerProps = {
  projectId: string
  theme?: string
  dbFilename?: string
}
export function DatabaseViewer({ projectId, theme, dbFilename }: DatabaseViewerProps) {
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
  useEffect(() => {
    if (selectedTable) {
    }
  }, [selectedTable, tables, tableRows])

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

        // Use the provided dbFilename or default to the first one
        if (dbFilename && files.some((file) => file.name === dbFilename)) {
          setSelectedDbFile(dbFilename)
        } else if (files.length > 0 && !selectedDbFile) {
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
  }, [projectId, dbFilename, refreshKey])

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

  useEffect(() => {
    // This ensures we don't lose data when view mode changes
    if (viewMode === "full" && selectedDbFile) {
      const fetchFullDatabaseView = async () => {
        try {
          setIsLoading(true)

          // Try to get full database view
          const fullView = await endpointService.getFullDatabaseView(projectId)

          if (fullView && fullView.length > 0) {
            // Find the current database in full view
            const dbInfo = fullView.find((db: any) => db.db_file === selectedDbFile)
            if (dbInfo && dbInfo.tables) {
              setTables(
                dbInfo.tables.map((table: any) => ({
                  name: table.name,
                  rowCount: table.rows?.length || 0,
                  columns: extractColumnsFromRows(table.rows || []),
                  rows: table.rows || [],
                })),
              )
            }
          }
        } catch (error) {
          console.error("Error fetching full database view:", error)
          setError("Failed to fetch full database view")
        } finally {
          setIsLoading(false)
        }
      }

      fetchFullDatabaseView()
    }
  }, [viewMode, selectedDbFile, projectId])

  // Add these helper functions to your component
  const extractColumnsFromRows = (rows: any[]): any[] => {
    if (!rows || rows.length === 0) return []

    // Get sample row to extract columns
    const sampleRow = rows[0]
    const columnNames = Object.keys(sampleRow)

    return columnNames.map((name) => {
      return {
        name: name,
        type: inferColumnType(rows[0][name]),
        nullable: rows.some((row) => row[name] === null),
        primaryKey: name.toLowerCase() === "id" || name.toLowerCase().endsWith("_id"),
      }
    })
  }

  const inferColumnType = (value: any): string => {
    if (value === null || value === undefined) return "unknown"

    const type = typeof value

    switch (type) {
      case "number":
        return Number.isInteger(value) ? "integer" : "float"
      case "string":
        return "text"
      case "boolean":
        return "boolean"
      case "object":
        return "json"
      default:
        return type
    }
  }

  useEffect(() => {
    if (!projectId || !selectedDbFile || !selectedTable) return

    const fetchTableRows = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const rows = await endpointService.getTableRows(projectId, selectedDbFile, selectedTable)

        setTableRows(rows)

        // IMPORTANT: Update the table's row count in the tables state
        if (tables.find((t) => t.name === selectedTable)?.rowCount !== rows.length) {

          setTables((prevTables) =>
            prevTables.map((table) => (table.name === selectedTable ? { ...table, rowCount: rows.length } : table)),
          )
        }
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
    <div className="flex flex-col h-full overflow-hidden bg-zinc-950 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 gap-2 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-3">
          <Select value={selectedDbFile || ""} onValueChange={setSelectedDbFile}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm bg-zinc-900 border-zinc-700">
              <SelectValue placeholder="Select database" />
            </SelectTrigger>
            <SelectContent>
              {dbFiles.map((file) => (
                <SelectItem key={file.name} value={file.name} className="text-sm">
                  {file.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center w-full sm:w-auto">
            <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as "tables" | "full")} className="w-full sm:w-auto">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger
                  value="tables"
                  onClick={() => {
                    ("Switching to tables view")
                    setViewMode("tables")
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <Table className="h-3.5 w-3.5 mr-1.5" />
                  Tables
                </TabsTrigger>
                <TabsTrigger
                  value="full"
                  onClick={() => {
                    ("Switching to full view")
                    setViewMode("full")
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <FileText className="h-3 w-3 mr-1.5" />
                  Full View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
  
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-auto">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
            <Input
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-xs sm:text-sm w-full sm:w-[180px]"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 flex-none" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
  
      {isLoading && <div className="bg-yellow-100 dark:bg-yellow-900/20 p-1.5 text-xs">Loading data...</div>}
      {error && <div className="bg-red-100 dark:bg-red-900/20 p-1.5 text-xs">Error: {error}</div>}
      
      <div className="flex-1 min-h-0 flex overflow-auto">
        {/* Rest of your content remains the same but will now be scrollable */}
        {viewMode === "tables" ? (
          <div className="flex flex-1 flex-col sm:flex-row min-h-0 overflow-hidden w-full">
            {/* Table list sidebar */}
            <div className="sm:w-56 border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 overflow-auto sm:h-full flex-shrink-0">
              <div className="p-3">
                <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Tables</h3>
                <div className="space-y-0.5">
                  {filteredTables.map((table) => (
                    <Button
                      key={table.name}
                      variant="ghost"
                      className={`w-full h-8 justify-start text-left text-xs ${
                        selectedTable === table.name ? "bg-zinc-100 dark:bg-zinc-800 font-medium" : ""
                      }`}
                      onClick={() => setSelectedTable(table.name)}
                    >
                      <Table className="h-3.5 w-3.5 mr-1.5 flex-none" />
                      <span className="truncate">{table.name}</span>
                      <Badge variant="outline" className="ml-auto text-[0.7rem] py-0 h-5 flex-none">
                        {table.rowCount}
                      </Badge>
                    </Button>
                  ))}
  
                  {filteredTables.length === 0 && (
                    <div className="text-center py-3 text-xs text-zinc-500 dark:text-zinc-400">No tables found</div>
                  )}
                </div>
              </div>
            </div>
  
            {/* Table content */}
            <div className="flex-1 overflow-auto min-h-0">
              {selectedTable ? (
                <>
                  <div className="p-2 sm:p-3 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                    <h2 className="text-sm sm:text-base font-medium flex items-center">
                      <Table className="h-3.5 w-3.5 mr-1.5" />
                      {selectedTable}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {tables.find((t) => t.name === selectedTable)?.rowCount || 0} rows (Actual: {tableRows.length}{" "}
                      rows)
                    </p>
                  </div>
  
                  <div className="flex-1 overflow-auto min-h-0">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-[#7dff00]" />
                      </div>
                    ) : tableRows.length > 0 ? (
                      <div className="p-2 sm:p-3">
                        <div className="border rounded-md overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                  {getColumnNames().map((column) => (
                                    <th
                                      key={column}
                                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-left text-[0.65rem] sm:text-[0.7rem] font-medium text-zinc-500 dark:text-zinc-400"
                                    >
                                      <div className="flex items-center flex-wrap gap-1 sm:gap-1.5">
                                        <span>{column}</span>
                                        <Badge className={`${getColumnBadgeClass(getColumnType(column))} text-[0.65rem] py-0 px-1 sm:px-1.5 h-4`}>
                                          {getColumnType(column)}
                                        </Badge>
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="text-[0.65rem] sm:text-xs">
                                {tableRows.map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className="border-b border-zinc-200 dark:border-zinc-700 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                  >
                                    {getColumnNames().map((column) => (
                                      <td key={`${rowIndex}-${column}`} className="px-2 sm:px-3 py-1 sm:py-1.5 break-words">
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
                      <div className="flex items-center justify-center h-full text-xs text-zinc-500 dark:text-zinc-400 p-4">
                        No rows found in this table
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-zinc-500 dark:text-zinc-400 p-4">
                  Select a table to view its data
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto min-h-0 p-2 sm:p-3 w-full">
            <Card>
              <CardHeader className="py-2 sm:py-3 px-3 sm:px-4">
                <CardTitle className="text-sm sm:text-base flex items-center">
                  <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  Database Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-3">
                {tables.length > 0 ? (
                  <Accordion type="multiple" defaultValue={tables.map((t) => t.name)} className="text-[0.7rem] sm:text-xs">
                    {tables.map((table) => (
                      <AccordionItem key={table.name} value={table.name}>
                        <AccordionTrigger className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 sm:px-3 py-1 sm:py-1.5 text-[0.75rem] sm:text-sm">
                          <div className="flex items-center">
                            <Table className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                            <span className="truncate max-w-[150px] sm:max-w-none">{table.name}</span>
                            <Badge variant="outline" className="ml-1.5 text-[0.65rem] sm:text-xs py-0 px-1 sm:px-1.5 h-4 sm:h-5">
                              {table.rows?.length || table.rowCount} rows
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-3 sm:pl-5 pr-2 sm:pr-3 pb-1.5 space-y-3">
                            {/* Column Metadata Table */}
                            <div className="border rounded-md overflow-hidden">
                              <table className="w-full text-[0.65rem] sm:text-xs">
                                <thead className="bg-zinc-50 dark:bg-zinc-800">
                                  <tr>
                                    <th className="px-2 sm:px-3 py-1 sm:py-1.5 text-left text-[0.65rem] sm:text-[0.7rem] text-zinc-500 dark:text-zinc-400">
                                      Column
                                    </th>
                                    <th className="px-2 sm:px-3 py-1 sm:py-1.5 text-left text-[0.65rem] sm:text-[0.7rem] text-zinc-500 dark:text-zinc-400">
                                      Type
                                    </th>
                                    <th className="px-2 sm:px-3 py-1 sm:py-1.5 text-left text-[0.65rem] sm:text-[0.7rem] text-zinc-500 dark:text-zinc-400">
                                      Nullable
                                    </th>
                                    <th className="px-2 sm:px-3 py-1 sm:py-1.5 text-left text-[0.65rem] sm:text-[0.7rem] text-zinc-500 dark:text-zinc-400">
                                      Primary Key
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.columns.map((column) => (
                                    <tr key={column.name}>
                                      <td className="px-2 sm:px-3 py-1 sm:py-1.5 truncate max-w-[100px] sm:max-w-none">{column.name}</td>
                                      <td className="px-2 sm:px-3 py-1 sm:py-1.5">
                                        <Badge className={`${getColumnBadgeClass(column.type)} text-[0.65rem] sm:text-[0.7rem] py-0 px-1 sm:px-1.5 h-4 sm:h-5`}>{column.type}</Badge>
                                      </td>
                                      <td className="px-2 sm:px-3 py-1 sm:py-1.5">
                                        {column.nullable ? (
                                          <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 text-[0.65rem] sm:text-[0.7rem] py-0 px-1 sm:px-1.5 h-4 sm:h-5">
                                            YES
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/20 text-[0.65rem] sm:text-[0.7rem] py-0 px-1 sm:px-1.5 h-4 sm:h-5">
                                            NO
                                          </Badge>
                                        )}
                                      </td>
                                      <td className="px-2 sm:px-3 py-1 sm:py-1.5">
                                        {column.primaryKey ? (
                                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 text-[0.65rem] sm:text-[0.7rem] py-0 px-1 sm:px-1.5 h-4 sm:h-5">
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
  
                            {/* Table Row Data */}
                            {table.rows && table.rows.length > 0 ? (
                              <div className="border rounded-md overflow-x-auto">
                                <table className="w-full text-[0.65rem] sm:text-xs">
                                  <thead className="bg-zinc-50 dark:bg-zinc-800">
                                    <tr>
                                      {Object.keys(table.rows[0]).map((col) => (
                                        <th
                                          key={col}
                                          className="px-2 sm:px-3 py-1 sm:py-1.5 text-left text-[0.65rem] sm:text-[0.7rem] text-zinc-500 dark:text-zinc-400"
                                        >
                                          {col}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {table.rows?.map((row: Record<string, any>, rowIndex) => (
                                      <tr
                                        key={rowIndex}
                                        className="border-b border-zinc-200 dark:border-zinc-700 last:border-0"
                                      >
                                        {Object.keys(row).map((col) => (
                                          <td key={`${rowIndex}-${col}`} className="px-2 sm:px-3 py-1 sm:py-1.5 break-words">
                                            {formatCellValue(row[col], col)}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-[0.65rem] sm:text-xs text-zinc-400">No rows found in this table</div>
                            )}
  
                            {/* Button to jump to this table in Tables View */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 h-7 sm:h-8 text-[0.65rem] sm:text-xs"
                              onClick={() => {
                                setSelectedTable(table.name)
                                setViewMode("tables")
                              }}
                            >
                              View in Table Mode
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="p-3 text-center text-[0.65rem] sm:text-xs text-zinc-500 dark:text-zinc-400">
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                        <span>Loading tables data...</span>
                      </div>
                    ) : (
                      <>
                        No tables found in this database.
                        <Button variant="link" className="ml-1.5 text-[0.65rem] sm:text-xs h-6 sm:h-7 p-0" onClick={handleRefresh}>
                          Refresh
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Custom styles for tabs */
        :global(.tab-accent.active) {
          color: #7dff00;
          border-color: #7dff00;
        }
        :global([data-state="active"]) {
          background-color: #7dff00 !important;
          color: black !important;
        }
      `}</style>
    </div>
  )
}
