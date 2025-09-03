import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/components/providers/AuthProviders";
import { userAddressAtom } from "@/stores/address";
import { useAtomValue } from "jotai";
import { toast } from "@/lib/toast";
import { createOrderFromCart } from "@/lib/api/orders";
import store from "@/stores/store";
import { userBasicAtom } from "@/stores/auth";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
 
export const useCreateOrder = () => {
    const userAddress = useAtomValue(userAddressAtom);
    const {userProfile} = useAuth()
    const router = useRouter();
    const addressParts = [
        userAddress?.data?.AddressLine1,
        userAddress?.data?.AddressLine2,
        userAddress?.data?.City,
        userAddress?.data?.State,
        userAddress?.data?.PostalCode,
        userAddress?.data?.Country,
        userProfile?.PhoneNumber
    ].filter(Boolean);
    const shippingAddress = addressParts.join(', ');
    return useMutation({
        mutationFn: (orderData) => {
            toast.loading("Placing your order...", { id: 'place-order' });
            return createOrderFromCart(shippingAddress);
        },
        onSuccess: (order) => {
            const userBasic = store.get(userBasicAtom);
            const queryKey = ['cart', userBasic?.id];
            queryClient.invalidateQueries({ queryKey });
            toast.success("Order placed successfully!", { id: 'place-order' });
            router.push(`/orders/${order.Id}`);
            return order;
        },
        onError: () => {
            toast.dismiss('place-order');
        }
    });

};

