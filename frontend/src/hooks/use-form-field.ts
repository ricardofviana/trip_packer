import * as React from "react"
import { FormFieldContext, FormItemContext } from "./form"

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    ...fieldContext,
  }
}

export { useFormField }
