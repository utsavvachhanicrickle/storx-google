import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";

import type { RootState, AppDispatch } from "./store";


// TYPED DISPATCH
export const useAppDispatch = () =>
  useDispatch<AppDispatch>();


// TYPED SELECTOR
export const useAppSelector: TypedUseSelectorHook<RootState> =
  useSelector;